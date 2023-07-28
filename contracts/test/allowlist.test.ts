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

describe("AllowlistPaymaster", function () {
  let provider: Provider;
  let wallet: Wallet;
  let deployer: Deployer;
  let emptyWallet: Wallet;
  let userWallet: Wallet;
  let userInitialBalance: ethers.BigNumber;
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
    userInitialBalance = await userWallet.getBalance();
    // deploy contracts
    paymaster = await deployContract(deployer, "AllowlistPaymaster", []);
    greeter = await deployContract(deployer, "Greeter", ["Hi"]);
    // fund paymaster
    await fundAccount(wallet, paymaster.address, "3");
    // set allowance for the user wallet
    const tx = await paymaster
      .connect(wallet)
      .setBatchAllowance([userWallet.address], [true]);
    await tx.wait();
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

  it("allowed user can update message for free", async function () {
    await executeGreetingTransaction(userWallet);
    const newBalance = await userWallet.getBalance();
    expect(await greeter.greet()).to.equal("Hola, mundo!");
    expect(newBalance).to.eql(userInitialBalance);
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

  it("should prevent non-allowed user from calling Greeter", async function () {
    const notAllowedWallet = Wallet.createRandom().connect(provider);
    try {
      await executeGreetingTransaction(notAllowedWallet);
      throw new Error("Should not be able to call Greeter");
    } catch (e) {
      expect(e.message).to.include("Account is not in allow list");
    }
  });
});
