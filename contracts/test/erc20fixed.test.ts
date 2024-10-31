import { expect } from "chai";
import { Wallet, Contract, utils, Signer } from "zksync-ethers";
import * as hre from "hardhat";

import { fundAccount, deployContract } from "../deploy/utils";

// load env file
import dotenv from "dotenv";
dotenv.config();

describe("ERC20fixedPaymaster", function () {
  let randomWallet: any;
  let emptyWallet: Wallet;
  let paymaster: Contract;
  let paymasterAddress: string;
  let greeter: Contract;
  let token: Contract;
  let tokenAddress: string;
  let signers: Signer[];
  let deployer: Signer;

  before(async function () {
    // retrieve default signers
    signers = await hre.ethers.getSigners();
    deployer = signers[0];

    // setup new empty wallet
    randomWallet = Wallet.createRandom();
    emptyWallet = new Wallet(randomWallet.privateKey, hre.ethers.provider);

    // deploy contracts
    token = await deployContract("MyERC20", ["MyToken", "MyToken", 18]);
    tokenAddress = await token.getAddress();
    paymaster = await deployContract("ERC20fixedPaymaster", [tokenAddress]);
    paymasterAddress = await paymaster.getAddress();
    greeter = await deployContract("Greeter", ["Hi"]);
    // fund paymaster
    await fundAccount(deployer, paymasterAddress, "3");
  });

  async function executeGreetingTransaction(user: Wallet) {
    const gasPrice = await hre.ethers.provider.getGasPrice();

    const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
      type: "ApprovalBased",
      token: tokenAddress,
      minimalAllowance: 1n,
      // empty bytes as testnet paymaster does not use innerInput
      innerInput: new Uint8Array(),
    });

    const setGreetingTx = await greeter
      .connect(user)
      .setGreeting("Hola, mundo!", {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: gasPrice,
        // hardcoded for testing
        gasLimit: 9000000,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

    await setGreetingTx.wait();
  }

  it("user with MyERC20 token can update message for free", async function () {
    const initialMintAmount = hre.ethers.parseEther("3");
    const success = await token.mint(emptyWallet.address, initialMintAmount);
    await success.wait();

    const userInitialTokenBalance = await token.balanceOf(emptyWallet.address);
    const userInitialETHBalance = await hre.ethers.provider.getBalance(
      emptyWallet.address,
    );
    const initialPaymasterBalance = await hre.ethers.provider.getBalance(
      paymasterAddress,
    );

    await executeGreetingTransaction(emptyWallet);

    const finalETHBalance = await hre.ethers.provider.getBalance(
      emptyWallet.address,
    );
    const finalUserTokenBalance = await token.balanceOf(emptyWallet.address);
    const finalPaymasterBalance = await hre.ethers.provider.getBalance(
      paymasterAddress,
    );

    expect(await greeter.greet()).to.equal("Hola, mundo!");
    expect(initialPaymasterBalance > finalPaymasterBalance).to.be.true;
    expect(userInitialETHBalance).to.eql(finalETHBalance);
    expect(userInitialTokenBalance > finalUserTokenBalance).to.be.true;
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
