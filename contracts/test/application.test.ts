import { expect } from "chai";
import { Wallet, Provider, Contract, utils, Signer } from "zksync-ethers";
import * as hre from "hardhat";

import { deployContract, fundAccount } from "../deploy/utils";

// load env file
import dotenv from "dotenv";
dotenv.config();

describe.only("ApplicationPaymaster", function () {
  let provider: Provider;
  let randomWallet: any;
  let emptyWallet: Wallet;
  let wallet: Wallet;
  let initialBalance: bigint;
  let paymaster: Contract;
  let paymasterAddress: string;
  let greeter: Contract;
  let greeterAddress: string;
  let erc721: Contract;
  let erc721Address: string;
  let signers: Signer[];
  let deployer: Signer;
  let errorOccurred = false;

  before(async function () {
    // retrieve default signers
    signers = await hre.ethers.getSigners();
    deployer = signers[0];
    // setup new empty wallet
    randomWallet = Wallet.createRandom();
    emptyWallet = new Wallet(randomWallet.privateKey, hre.ethers.provider);
    initialBalance = await hre.ethers.provider.getBalance(emptyWallet.address);

    // deploy contracts
    greeter = await deployContract("Greeter", ["Hi"]);
    greeterAddress = await greeter.getAddress();
    erc721 = await deployContract("MyNFT", []);
    erc721Address = await erc721.getAddress();
    paymaster = await deployContract("ApplicationPaymaster", [greeterAddress]);
    paymasterAddress = await paymaster.getAddress();
    // fund paymaster
    await fundAccount(deployer, paymasterAddress, "3");
  });

  async function executeGreetingTransaction(user: Wallet) {
    const gasPrice = await hre.ethers.provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
      type: "General",
      // empty bytes as paymaster does not use innerInput
      innerInput: new Uint8Array(),
    });
    const setGreetingTx = await greeter
      .connect(user)
      .setGreeting("Hello World", {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: gasPrice,
        // hardcoded for testing
        gasLimit: 6000000,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

    await setGreetingTx.wait();
  }

  async function executeERC721Transaction(user: Wallet) {
    const gasPrice = await hre.ethers.provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
      type: "General",
      // empty bytes as paymaster does not use innerInput
      innerInput: new Uint8Array(),
    });
    const erc721Tx = await erc721
      .connect(user)
      .createCollectible(user.address, {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: gasPrice,
        // hardcoded for testing
        gasLimit: 6000000,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

    await erc721Tx.wait();
  }

  it("should pay for gas fees when user calls allowed function selector", async function () {
    await executeGreetingTransaction(emptyWallet);
    const newBalance = await hre.ethers.provider.getBalance(
      emptyWallet.address,
    );

    expect(await greeter.greet()).to.equal("Hello World");
    expect(newBalance).to.eql(initialBalance);
  });

  it("should fail validation when user calls not allowed contract", async function () {
    try {
      await executeERC721Transaction(emptyWallet);
    } catch (error) {
      errorOccurred = true;
      expect(error.message).to.include("Unsupported contract address");
    }
    expect(errorOccurred).to.be.true;
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

    const finalContractBalance = await hre.ethers.provider.getBalance(
      paymasterAddress,
    );

    expect(finalContractBalance).to.eql(0n);
  });

  it("should prevent non-owners from withdrawing funds", async function () {
    try {
      await paymaster.connect(emptyWallet).withdraw(emptyWallet.address);
    } catch (e) {
      expect(e.message).to.include("Ownable: caller is not the owner");
    }
  });
});
