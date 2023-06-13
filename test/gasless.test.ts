import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";

import { deployContract, fundAccount } from "./utils";

const RICH_WALLET_PK =
  "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

describe("Gasless Paymaster", function () {
  it("Empty account can update message for free", async function () {
    const provider = Provider.getDefaultProvider();

    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const deployer = new Deployer(hre, wallet);

    const paymaster = await deployContract(deployer, "GaslessPaymaster", []);
    const greeter = await deployContract(deployer, "Greeter", ["Hi"]);

    await fundAccount(wallet, paymaster.address, "3");

    // console.log("Paymaster funded");

    // const pmBalance = await provider.getBalance(paymaster.address);

    // console.log("paymaster balance :>> ", pmBalance.toString());

    const gasPrice = await provider.getGasPrice();

    const initialBalance = await wallet.getBalance();

    // console.log("initialBalance :>> ", initialBalance.toString());
    expect(await greeter.greet()).to.eq("Hi");

    const paymasterParams = utils.getPaymasterParams(paymaster.address, {
      type: "General",
      // empty bytes as paymaster does not use innerInput
      innerInput: new Uint8Array(),
    });

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!", {
      maxPriorityFeePerGas: ethers.BigNumber.from(0),
      maxFeePerGas: gasPrice,
      // hardhcoded for testing
      gasLimit: 6000000,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    });
    // wait until the transaction is mined
    await setGreetingTx.wait();

    const newBalance = await wallet.getBalance();

    // console.log("newBalance :>> ", newBalance.toString());

    expect(await greeter.greet()).to.equal("Hola, mundo!");
    expect(newBalance).to.eql(initialBalance);
  });
});
