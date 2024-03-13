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
// The address of the NFT collection contract
const NFT_COLLECTION_ADDRESS = "ADDRESS_OF_NFT_COLLECTION_CONTRACT";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

if (!NFT_COLLECTION_ADDRESS)
  throw "⛔️ NFT_COLLECTION_ADDRESS not detected! Add it to the NFT_COLLECTION_ADDRESS variable!";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the ERC721gatedPaymaster contract...`);
  const provider = new Provider((hre.network.config as HttpNetworkUserConfig).url);

  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  const wallet = new Wallet(PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // Deploying the paymaster
  const paymasterArtifact = await deployer.loadArtifact("ERC721gatedPaymaster");
  const deploymentFee = await deployer.estimateDeployFee(paymasterArtifact, [
    NFT_COLLECTION_ADDRESS,
  ]);
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);
  // Deploy the contract
  const paymaster = await deployer.deploy(paymasterArtifact, [
    NFT_COLLECTION_ADDRESS,
  ]);
  console.log(`Paymaster address: ${paymaster.address}`);

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await (
    await deployer.zkWallet.sendTransaction({
      to: paymaster.address,
      value: ethers.utils.parseEther("0.005"),
    })
  ).wait();

  let paymasterBalance = await provider.getBalance(paymaster.address);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName =
    "contracts/paymasters/ERC721gatedPaymaster.sol:ERC721gatedPaymaster";
  const verificationId = await hre.run("verify:verify", {
    address: paymaster.address,
    contract: contractFullyQualifedName,
    constructorArguments: [NFT_COLLECTION_ADDRESS],
    bytecode: paymasterArtifact.bytecode,
  });
  console.log(
    `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
  );

  console.log(`Done!`);
}
