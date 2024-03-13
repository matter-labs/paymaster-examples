import * as ethers from "ethers";
import { Provider, Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import {
  HardhatRuntimeEnvironment,
  HttpNetworkUserConfig,
} from "hardhat/types";
// load env file
import dotenv from "dotenv";

dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the TimeBasedPaymaster contract...`);
  const provider = new Provider((hre.network.config as HttpNetworkUserConfig).url);

  const wallet = new Wallet(PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  const paymasterArtifact = await deployer.loadArtifact("TimeBasedPaymaster");
  const deploymentFee = await deployer.estimateDeployFee(paymasterArtifact, []);
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);
  // Deploy the contract
  const paymaster = await deployer.deploy(paymasterArtifact, []);
  console.log(`Paymaster address: ${paymaster.address}`);
  console.log("constructor args:" + paymaster.interface.encodeDeploy([]));

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await (
    await deployer.zkWallet.sendTransaction({
      to: paymaster.address,
      value: ethers.utils.parseEther("0.001"),
    })
  ).wait();

  let paymasterBalance = await provider.getBalance(paymaster.address);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName =
    "contracts/paymasters/TimeBasedPaymaster.sol:TimeBasedPaymaster";
  const verificationId = await hre.run("verify:verify", {
    address: paymaster.address,
    contract: contractFullyQualifedName,
    constructorArguments: [],
    bytecode: paymasterArtifact.bytecode,
  });
  console.log(
    `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
  );
  console.log(`Done!`);
}
