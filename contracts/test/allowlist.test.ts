import { expect } from "chai";
import { Wallet, Contract, utils, Signer } from "zksync-ethers";
import * as hre from "hardhat";
import { deployContract, fundAccount } from "../deploy/utils";

// load env file
import dotenv from "dotenv";
dotenv.config();

describe("AllowlistPaymaster", function () {
  let randomWallet: any;
  let emptyWallet: Wallet;
  let userInitialBalance: bigint;
  let paymaster: Contract;
  let greeter: Contract;
  let paymasterAddress: string;
  let signers: Signer[];
  let deployer: Signer;

  before(async function () {
    // retrieve default signers
    signers = await hre.ethers.getSigners();
    deployer = signers[0];

    // setup new empty wallet
    randomWallet = Wallet.createRandom();
    emptyWallet = new Wallet(randomWallet.privateKey, hre.ethers.provider);

    userInitialBalance = await hre.ethers.provider.getBalance(
      emptyWallet.address,
    );

    // deploy contracts

    paymaster = await deployContract("AllowlistPaymaster", []);
    greeter = await deployContract("Greeter", ["Hi"]);
    paymasterAddress = await paymaster.getAddress();

    await fundAccount(deployer, paymasterAddress, "3");

    // set allowance for the user wallet
    const allowanceTx = await paymaster
      .connect(deployer)
      .setBatchAllowance([emptyWallet.address], [true]);
    await allowanceTx.wait();
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
      .setGreeting("Hola, mundo!", {
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

  it("allowed user can update message for free", async function () {
    await executeGreetingTransaction(emptyWallet);
    const newBalance = await hre.ethers.provider.getBalance(
      emptyWallet.address,
    );
    expect(await greeter.greet()).to.equal("Hola, mundo!");
    expect(newBalance).to.eql(userInitialBalance);
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
  it("should prevent non-allowed user from calling Greeter", async function () {
    const notAllowedWallet = signers[1];
    try {
      await executeGreetingTransaction(notAllowedWallet);
    } catch (e) {
      // console.error(e);
      expect(e.message).to.include("Account is not in allow list");
    }
  });
});
