import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";

import { deployContract, fundAccount } from "./utils";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

describe("GaslessPaymaster", function () {
  let provider: Provider;
  let wallet: Wallet;
  let deployer: Deployer;
  let emptyWallet: Wallet;
  let userWallet: Wallet;
  let ownerInitialBalance: ethers.BigNumber;
  let paymaster: Contract;
  let greeter: Contract;

  before(async function () {
    // setup deployer
    provider = Provider.getDefaultProvider();
    wallet = new Wallet(PRIVATE_KEY, provider);
    deployer = new Deployer(hre, wallet);
    // setup new wallet
    emptyWallet = Wallet.createRandom();
    console.log(`Empty wallet's address: ${emptyWallet.address}`);
    userWallet = new Wallet(emptyWallet.privateKey, provider);
    // deploy contracts
    paymaster = await deployContract(deployer, "GaslessPaymaster", []);
    greeter = await deployContract(deployer, "Greeter", ["Hi"]);
    // fund paymaster
    await fundAccount(wallet, paymaster.address, "3");
    ownerInitialBalance = await wallet.getBalance();
  });

  async function executeGreetingTransaction(user: Wallet) {
    const gasPrice = await provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymaster.address, {
      type: "General",
      // empty bytes as paymaster does not use innerInput
      innerInput: new Uint8Array(),
    });

    const setGreetingTx = await greeter
      .connect(user)
      .setGreeting("Hola, mundo!", {
        maxPriorityFeePerGas: ethers.BigNumber.from(0),
        maxFeePerGas: gasPrice,
        // hardhcoded for testing
        gasLimit: 6000000,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

    await setGreetingTx.wait();

    return wallet.getBalance();
  }

  it("Owner can update message for free", async function () {
    const newBalance = await executeGreetingTransaction(userWallet);

    expect(await greeter.greet()).to.equal("Hola, mundo!");
    expect(newBalance).to.eql(ownerInitialBalance);
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

  it("should prevent non-owners from withdrawing funds", async function () {
    try {
      await paymaster.connect(userWallet).withdraw(userWallet.address);
      throw new Error("Should not be able to withdraw funds");
    } catch (e) {
      expect(e.message).to.include("Ownable: caller is not the owner");
    }
  });
});
