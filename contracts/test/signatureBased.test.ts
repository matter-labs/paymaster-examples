import { expect } from "chai";
import { Wallet, Provider, Contract, utils, Signer } from "zksync-ethers";
import * as hre from "hardhat";
import { deployContract, fundAccount } from "../deploy/utils";

import dotenv from "dotenv";
dotenv.config();

const abiCoder = new hre.ethers.AbiCoder();

describe("SignatureBasedPaymaster", function () {
  let provider: Provider;
  let randomWallet: any;
  let emptyWallet: Wallet;
  let signerWallet: Wallet;
  let paymaster: Contract;
  let paymasterAddress: string;
  let greeter: Contract;
  let signers: Signer[];
  let deployer: Signer;

  before(async function () {
    // retrieve default signers
    signers = await hre.ethers.getSigners();
    deployer = signers[0];
    provider = hre.ethers.provider;

    // setup new empty wallet
    randomWallet = Wallet.createRandom();
    emptyWallet = new Wallet(randomWallet.privateKey, hre.ethers.provider);

    const randomWallet2 = Wallet.createRandom();

    signerWallet = new Wallet(randomWallet2.privateKey, provider);
    paymaster = await deployContract("SignatureBasedPaymaster", [
      signerWallet.address,
    ]);
    paymasterAddress = await paymaster.getAddress();

    greeter = await deployContract("Greeter", ["Hi"]);
    await fundAccount(deployer, paymasterAddress, "3");
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

    const signature = await signer.signTypedData(domain, types, values);

    return [signature, lastTimestamp];
  }

  async function executeGreetingTransaction(
    user: Wallet,
    _innerInput: Uint8Array,
  ) {
    const gasPrice = await provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
      type: "General",
      innerInput: _innerInput,
    });

    const setGreetingTx = await greeter
      .connect(user)
      .setGreeting("Hola, mundo!", {
        maxPriorityFeePerGas: 0n,
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
    const beforeNonce = await paymaster.nonces(emptyWallet.address);
    const [sig, lastTimestamp] = await createSignatureData(
      signerWallet,
      emptyWallet,
      expiryInSeconds,
    );

    const innerInput = hre.ethers.getBytes(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    await executeGreetingTransaction(emptyWallet, innerInput);
    const afterNonce = await paymaster.nonces(emptyWallet.address);
    expect(afterNonce - beforeNonce).to.be.eq(1n);
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("should fail to use paymaster if signature signed with invalid signer", async function () {
    // Arrange
    let errorOccurred = false;
    const expiryInSeconds = 300;
    const invalidSigner = Wallet.createRandom();
    const [sig, lastTimestamp] = await createSignatureData(
      invalidSigner,
      emptyWallet,
      expiryInSeconds,
    );

    const innerInput = hre.ethers.getBytes(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    try {
      await executeGreetingTransaction(emptyWallet, innerInput);
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
      emptyWallet,
      expiryInSeconds,
    );

    const innerInput = hre.ethers.getBytes(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    let newTimestamp: number = +lastTimestamp + 1;
    await provider.send("evm_increaseTime", [newTimestamp]);
    await provider.send("evm_mine", []);

    // Act

    try {
      await executeGreetingTransaction(emptyWallet, innerInput);
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
      emptyWallet,
      expiryInSeconds,
    );

    const innerInput = hre.ethers.getBytes(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    await paymaster.cancelNonce(emptyWallet.address);

    try {
      await executeGreetingTransaction(emptyWallet, innerInput);
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
      emptyWallet,
      expiryInSeconds,
    );

    const innerInput = hre.ethers.getBytes(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    try {
      await executeGreetingTransaction(deployer, innerInput);
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
      emptyWallet,
      expiryInSeconds,
    );

    const innerInput = hre.ethers.getBytes(
      abiCoder.encode(["uint256", "bytes"], [lastTimestamp, sig]),
    );
    // Act
    try {
      await executeGreetingTransaction(emptyWallet, innerInput);
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
      await paymaster.connect(emptyWallet).withdraw(emptyWallet.address);
    } catch (e) {
      expect(e.message).to.include("Ownable: caller is not the owner");
    }
  });

  it("should allow owner to withdraw all funds", async function () {
    try {
      const tx = await paymaster
        .connect(deployer)
        .withdraw(emptyWallet.address);
      await tx.wait();
    } catch (e) {
      console.error("Error executing withdrawal:", e);
    }

    const finalContractBalance = await provider.getBalance(paymasterAddress);

    expect(finalContractBalance).to.eql(0n);
  });
});
