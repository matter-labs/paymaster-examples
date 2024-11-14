import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-ethers";
import * as hre from "hardhat";

import { deployContract, fundAccount } from "../deploy/utils";

import dotenv from "dotenv";
dotenv.config();

describe("TimeBasedPaymaster", function () {
  let provider: Provider;
  let randomWallet: any;
  let emptyWallet: Wallet;
  let paymaster: Contract;
  let greeter: Contract;
  let paymasterAddress: string;
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

    // deploy contracts
    paymaster = await deployContract("TimeBasedPaymaster", []);
    greeter = await deployContract("Greeter", ["Hi"]);
    paymasterAddress = await paymaster.getAddress();

    await fundAccount(deployer, paymasterAddress, "3");
  });

  async function executeGreetingTransaction(user: Wallet) {
    const gasPrice = await provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
      type: "General",
      innerInput: new Uint8Array(),
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

  it("should fail due to Paymaster validation error outside the time window", async function () {
    // Arrange
    let errorOccurred = false;
    const currentDate = new Date();
    currentDate.setUTCHours(10);
    currentDate.setUTCMinutes(1);
    currentDate.setUTCSeconds(0);
    currentDate.setUTCMilliseconds(0);
    const targetTime = Math.floor(currentDate.getTime() / 1000);
    const newTimestampHex = `0x${targetTime.toString(16)}`;

    await provider.send("evm_setNextBlockTimestamp", [newTimestampHex]);
    await provider.send("evm_mine", []);

    // Act
    try {
      await executeGreetingTransaction(emptyWallet);
    } catch (error) {
      errorOccurred = true;
      expect(error.message).to.include("Paymaster validation error");
    }
    // Assert
    expect(errorOccurred).to.be.true;
  });

  it("should cost the user no gas during the time window", async function () {
    // Arrange
    const currentDate = new Date();
    currentDate.setUTCHours(14);
    currentDate.setUTCMinutes(2);
    currentDate.setUTCSeconds(0);
    currentDate.setUTCMilliseconds(0);
    const targetTime = Math.floor(currentDate.getTime() / 1000);
    const newTimestampHex = `0x${targetTime.toString(16)}`;

    await provider.send("evm_setNextBlockTimestamp", [newTimestampHex]);
    await provider.send("evm_mine", []);

    // Act
    const initialBalance = await provider.getBalance(emptyWallet.address);
    await executeGreetingTransaction(emptyWallet);
    await provider.send("evm_mine", []);
    const newBalance = await provider.getBalance(emptyWallet.address);

    // Assert
    expect(newBalance.toString()).to.equal(initialBalance.toString());
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
