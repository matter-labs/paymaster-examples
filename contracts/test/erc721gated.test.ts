import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";
import hardhatConfig from "../hardhat.config";

import { deployContract, fundAccount, setupDeployer } from "./utils";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY =
  process.env.WALLET_PRIVATE_KEY ||
  "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

describe("ERC721gatedPaymaster", function () {
  let provider: Provider;
  let wallet: Wallet;
  let deployer: Deployer;
  let userWallet: Wallet;
  let initialBalance: ethers.BigNumber;
  let otherBalance: ethers.BigNumber;
  let paymaster: Contract;
  let greeter: Contract;
  let erc721: Contract;

  before(async function () {
    const deployUrl = hardhatConfig.networks.zkSyncInMemory.url;
    // setup deployer
    [provider, wallet, deployer] = setupDeployer(deployUrl, PRIVATE_KEY);
    // setup new wallet
    userWallet = Wallet.createRandom();
    userWallet = new Wallet(userWallet.privateKey, provider);
    initialBalance = await userWallet.getBalance();
    // deploy contracts
    erc721 = await deployContract(deployer, "MyNFT", []);
    paymaster = await deployContract(deployer, "ERC721gatedPaymaster", [
      erc721.address,
    ]);
    greeter = await deployContract(deployer, "Greeter", ["Hi"]);
    // fund paymaster
    await fundAccount(wallet, paymaster.address, "3");
    otherBalance = await wallet.getBalance();
  });

  async function executeGreetingTransaction(user: Wallet) {
    const gasPrice = await provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymaster.address, {
      type: "General",
      // empty bytes as paymaster does not use innerInput
      innerInput: new Uint8Array(),
    });
    console.log("user: ", user.address);
    const setGreetingTx = await greeter
      .connect(user)
      .setGreeting("Hello World", {
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

  it("should not pay for gas fees when user has NFT", async function () {
    const tx = await erc721
      .connect(wallet)
      .createCollectible(userWallet.address);
    await tx.wait();

    await executeGreetingTransaction(userWallet);
    const newBalance = await userWallet.getBalance();

    expect(await greeter.greet()).to.equal("Hello World");
    expect(newBalance).to.eql(initialBalance);
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
    } catch (e) {
      expect(e.message).to.include("Ownable: caller is not the owner");
    }
  });
});
