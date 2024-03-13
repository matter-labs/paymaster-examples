import { Provider, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HttpNetworkUserConfig } from "hardhat/types";

// load env file
import dotenv from "dotenv";

dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(
    `Running deploy script for the SignatureBasedPaymaster contract...`,
  );
  // Currently targeting the Sepolia zkSync testnet
  const network = hre.userConfig.networks?.zkSyncTestnet;
  const provider = new Provider((network as HttpNetworkUserConfig).url);

  // The wallet that will deploy the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  const wallet = new Wallet(PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // Deploying the paymaster
  const paymasterArtifact = await deployer.loadArtifact(
    "SignatureBasedPaymaster",
  );
  const deploymentFee = await deployer.estimateDeployFee(paymasterArtifact, [wallet.address]);
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);
  // Deploy the contract with owner as signer
  const paymaster = await deployer.deploy(paymasterArtifact, [wallet.address]);
  console.log(`Paymaster address: ${paymaster.address}`);
  console.log(`Signer of the contract: ${wallet.address}`); 

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await (
    await deployer.zkWallet.sendTransaction({
      to: paymaster.address,
      value: ethers.utils.parseEther("0.005"),
    })
  ).wait();

  let paymasterBalance = await provider.getBalance(paymaster.address);
// Only verify on live networks
  if (
    hre.network.name == "zkSyncTestnet" ||
    hre.network.name == "zkSyncMainnet"
  ) {
    // Verify contract programmatically
    //
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const contractFullyQualifedName =
      "contracts/paymasters/SignatureBasedPaymaster.sol:SignatureBasedPaymaster";
    const verificationId = await hre.run("verify:verify", {
      address: paymaster.address,
      contract: contractFullyQualifedName,
      constructorArguments: [wallet.address],
      bytecode: paymasterArtifact.bytecode,
    });
    console.log(
      `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
    );
  }
  console.log(`Done!`);


}
