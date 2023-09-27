import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-web3";
import hardhatConfig from "../hardhat.config";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";

import { deployContract, fundAccount, setupDeployer } from "./utils";

import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

describe("TimeBasedPaymaster", function () {
  let provider: Provider;
  let wallet: Wallet;
  let deployer: Deployer;
  let userWallet: Wallet;
  let paymaster: Contract;
  let greeter: Contract;

  before(async function () {
    const deployUrl = hardhatConfig.networks.zkSyncTestnet.url;
    [provider, wallet, deployer] = setupDeployer(deployUrl, PRIVATE_KEY);
    userWallet = Wallet.createRandom();
    console.log(`User wallet's address: ${userWallet.address}`);
    userWallet = new Wallet(userWallet.privateKey, provider);
    paymaster = await deployContract(deployer, "TimeBasedPaymaster", []);
    greeter = await deployContract(deployer, "Greeter", ["Hi"]);
    await fundAccount(wallet, paymaster.address, "3");
  });

  async function setTimeTo(timestamp) {
    await provider.send("evm_setNextBlockTimestamp", [timestamp]);
    await provider.send("evm_mine", []);
  }

  async function executeGreetingTransaction(user: Wallet) {
    const gasPrice = await provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymaster.address, {
      type: "General",
      innerInput: new Uint8Array(),
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

  it("should cost the user no gas during the time window", async function () {
    // Arrange
    const currentDate = new Date();
    currentDate.setUTCHours(23);
    currentDate.setUTCMinutes(10);
    currentDate.setUTCSeconds(0);
    currentDate.setUTCMilliseconds(0);
    const targetTime = Math.floor(currentDate.getTime() / 1000);
    await setTimeTo(targetTime);
    // Act
    const initialBalance = await userWallet.getBalance();
    await executeGreetingTransaction(userWallet);
    const newBalance = await userWallet.getBalance();
    // Assert
    expect(newBalance.toString()).to.equal(initialBalance.toString());
  });

  it("should cost the user gas outside the time window", async function () {
    // Arrange
    const initialBalance = await wallet.getBalance();
    // Act
    await executeGreetingTransaction(wallet);
    const newBalance = await wallet.getBalance();
    // Assert
    expect(newBalance.lt(initialBalance)).to.be.true;
  });
});
