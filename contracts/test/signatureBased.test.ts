import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-web3";
import hardhatConfig from "../hardhat.config";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";

import { deployContract, fundAccount, setupDeployer } from "./utils";

import dotenv from "dotenv";
import { _TypedDataEncoder } from "ethers/lib/utils";
dotenv.config();

const PRIVATE_KEY =
  process.env.WALLET_PRIVATE_KEY ||
  "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
const abiCoder = new ethers.utils.AbiCoder();

describe("SignatureBasedPaymaster", function () {
  let provider: Provider;
  let wallet: Wallet;
  let deployer: Deployer;
  let userWallet: Wallet;
  let signerWallet: Wallet;
  let paymaster: Contract;
  let greeter: Contract;

  before(async function () {
    const deployUrl = hardhatConfig.networks.zkSyncInMemory.url;
    [provider, wallet, deployer] = setupDeployer(deployUrl, PRIVATE_KEY);
    const emptyWallet = Wallet.createRandom();
    console.log(`User wallet's address: ${emptyWallet.address}`);
    userWallet = new Wallet(emptyWallet.privateKey, provider);
    signerWallet = Wallet.createRandom();
    console.log(`Signer wallet's address: ${signerWallet.address}`);
    signerWallet = new Wallet(signerWallet.privateKey, provider);
    paymaster = await deployContract(deployer, "SignatureBasedPaymaster", [
      signerWallet.address,
    ]);
    greeter = await deployContract(deployer, "Greeter", ["Hi"]);
    await fundAccount(wallet, paymaster.address, "3");
    console.log(`Paymaster current signer: ${signerWallet.address}`);
  });

  async function createSignatureData(
    signer: Wallet,
    user: Wallet,
    expiryInSeconds: number,
  ) {
    const nonce = await paymaster.nonces(user.address);
    const typeHash = await paymaster.SIGNATURE_TYPEHASH();
    const eip712Domain = await paymaster.eip712Domain();
    const currentTimestamp = (await provider.getBlock("latest")).timestamp;
    const lastTimestamp = currentTimestamp + expiryInSeconds; // 300 seconds

    const domain = {
      name: eip712Domain[1],
      version: eip712Domain[2],
      chainId: eip712Domain[3],
      verifyingContract: eip712Domain[4],
    };
    // @dev : Upon changing types here, you need to ensure that
    // `SIGNATURE_TYPEHASH` constant in signatureBasedPaymaster contract matches the changes
    // Otherwise EIP712Domain based _signedTypedData will return wrong signatures.
    // And test will fail.
    const types = {
      SignatureBasedPaymaster: [
        { name: "userAddress", type: "address" },
        { name: "lastTimestamp", type: "uint256" },
        { name: "nonces", type: "uint256" },
      ],
    };
    const values = {
      userAddress: user.address,
      lastTimestamp: lastTimestamp,
      nonces: nonce,
    };

    const signature = await signer._signTypedData(domain, types, values);
    return [signature, lastTimestamp];
  }

  async function executeGreetingTransaction(
    user: Wallet,
    _innerInput: Uint8Array,
  ) {
    const gasPrice = await provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymaster.address, {
      type: "General",
      innerInput: _innerInput,
    });

    const setGreetingTx = await greeter
      .connect(user)
      .setGreeting("Hola, mundo!", {
        maxPriorityFeePerGas: ethers.BigNumber.from(0),
        maxFeePerGas: gasPrice,
        gasLimit: 6000000,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

    await setGreetingTx.wait();
  }

  it("should allow user to use paymaster if signature valid and used before expiry and nonce should be updated", async function () {
    const expiryInSeconds = 300;
    const beforeNonce = await paymaster.nonces(userWallet.address);
    const [sig, lastTimestamp] = await createSignatureData(
      signerWallet,
      userWallet,
      expiryInSeconds,
    );

    const innerInput = ethers.utils.arrayify(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    await executeGreetingTransaction(userWallet, innerInput);
    const afterNonce = await paymaster.nonces(userWallet.address);
    expect(afterNonce - beforeNonce).to.be.eq(1);
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("should fail to use paymaster if signature signed with invalid signer", async function () {
    // Arrange
    let errorOccurred = false;
    const expiryInSeconds = 300;
    const invalidSigner = Wallet.createRandom();
    const [sig, lastTimestamp] = await createSignatureData(
      invalidSigner,
      userWallet,
      expiryInSeconds,
    );

    const innerInput = ethers.utils.arrayify(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    try {
      await executeGreetingTransaction(userWallet, innerInput);
    } catch (error) {
      errorOccurred = true;
      expect(error.message).to.include("Paymaster: Invalid signer");
    }
    // Assert
    expect(errorOccurred).to.be.true;
  });

  it("should fail to use paymaster if signature expired as lastTimestamp is passed ", async function () {
    // Arrange

    let errorOccurred = false;
    const expiryInSeconds = 300;
    const [sig, lastTimestamp] = await createSignatureData(
      signerWallet,
      userWallet,
      expiryInSeconds,
    );

    const innerInput = ethers.utils.arrayify(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    let newTimestamp: number = +lastTimestamp + 1;
    await provider.send("evm_increaseTime", [newTimestamp]);
    await provider.send("evm_mine", []);

    // Act

    try {
      await executeGreetingTransaction(userWallet, innerInput);
    } catch (error) {
      errorOccurred = true;
      expect(error.message).to.include("Paymaster: Signature expired");
    }
    // Assert
    expect(errorOccurred).to.be.true;
  });

  it("should fail to use paymaster if nonce updated by the owner to prevent any malicious transaction", async function () {
    // Arrange

    let errorOccurred = false;
    const expiryInSeconds = 300;
    const [sig, lastTimestamp] = await createSignatureData(
      signerWallet,
      userWallet,
      expiryInSeconds,
    );

    const innerInput = ethers.utils.arrayify(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    await paymaster.cancelNonce(userWallet.address);

    try {
      await executeGreetingTransaction(userWallet, innerInput);
    } catch (error) {
      errorOccurred = true;
      expect(error.message).to.include("Paymaster: Invalid signer");
    }
    // Assert
    expect(errorOccurred).to.be.true;
  });

  it("should fail to use paymaster if signature used by different user", async function () {
    // Arrange

    let errorOccurred = false;
    const expiryInSeconds = 300;
    const [sig, lastTimestamp] = await createSignatureData(
      signerWallet,
      userWallet,
      expiryInSeconds,
    );

    const innerInput = ethers.utils.arrayify(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    try {
      await executeGreetingTransaction(wallet, innerInput);
    } catch (error) {
      errorOccurred = true;
      expect(error.message).to.include("Paymaster: Invalid signer");
    }
    // Assert
    expect(errorOccurred).to.be.true;
  });

  it("should allow owner to update to newSigner and function properly as well", async function () {
    // Arrange

    let errorOccurred = false;
    const newSigner = Wallet.createRandom();
    await paymaster.changeSigner(newSigner.address);

    const expiryInSeconds = 300;
    const [sig, lastTimestamp] = await createSignatureData(
      newSigner,
      userWallet,
      expiryInSeconds,
    );

    const innerInput = ethers.utils.arrayify(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    try {
      await executeGreetingTransaction(userWallet, innerInput);
    } catch (error) {
      errorOccurred = true;
    }
    // Assert
    expect(errorOccurred).to.be.false;

    // Revert back to original signer for other test to pass.
    await paymaster.changeSigner(signerWallet.address);
  });

  it("should prevent non-owners from withdrawing funds", async function () {
    try {
      await paymaster.connect(userWallet).withdraw(userWallet.address);
    } catch (e) {
      expect(e.message).to.include("Ownable: caller is not the owner");
    }
  });

  it("should allow owner to withdraw all funds", async function () {
    try {
      const tx = await paymaster.connect(wallet).withdraw(userWallet.address);
      await tx.wait();
    } catch (e) {
      console.error("Error executing withdrawal:", e);
    }

    const finalContractBalance = await provider.getBalance(paymaster.address);

    expect(finalContractBalance).to.eql(ethers.BigNumber.from(0));
  });
});
