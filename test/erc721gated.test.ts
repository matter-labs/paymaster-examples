import { expect } from "chai";
import { Wallet, Provider, Contract, utils } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";

import { deployContract, fundAccount } from "./utils";

const RICH_WALLET_PK =
  "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

describe("ERC721gatedPaymaster", function () {
  let provider: Provider;
  let wallet: Wallet;
  let deployer: Deployer;
  let userWallet: Wallet;
  let initialBalance: ethers.BigNumber;
  let paymaster: Contract;
  let greeter: Contract;

  beforeEach(async function () {
    provider = Provider.getDefaultProvider();
    wallet = new Wallet(RICH_WALLET_PK, provider);
    deployer = new Deployer(hre, wallet);

    userWallet = Wallet.createRandom();
    initialBalance = await userWallet.getBalance();

    paymaster = await deployContract(deployer, "ERC721gatedPaymaster", []);
    greeter = await deployContract(deployer, "Greeter", ["Hi"]);

    await fundAccount(wallet, paymaster.address, "3");
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

    // wait until the transaction is mined
    await setGreetingTx.wait();

    return wallet.getBalance();
  }

  it("should not pay for gas fees when user has NFT", async function () {
    const erc721 = await deployContract(deployer, "MyNFT", []);
    await erc721.createCollectible(
      "https://my.token.uri/1",
      userWallet.address
    );

    const newBalance = await executeGreetingTransaction(userWallet);

    expect(await greeter.greet()).to.equal("Hello World");
    expect(newBalance).to.eql(initialBalance);
  });

  it("should pay for gas fees when user does not have NFT", async function () {
    const newBalance = await executeGreetingTransaction(userWallet);

    expect(await greeter.greet()).to.equal("Hello World");
    expect(newBalance).to.eql(initialBalance);
  });
});
