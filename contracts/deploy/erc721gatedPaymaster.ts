import { fundAccount, deployContract } from "./utils";
import * as hre from "hardhat";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
// The address of the NFT collection contract
const NFT_COLLECTION_ADDRESS = "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

if (!NFT_COLLECTION_ADDRESS)
  throw "⛔️ NFT_COLLECTION_ADDRESS not detected! Add it to the NFT_COLLECTION_ADDRESS variable!";

async function main() {
  const contract = "ERC721gatedPaymaster";
  const artifact = await hre.ethers.loadArtifact(contract);

  console.log(
    `Running script to deploy ${artifact.contractName} contract on ${hre.network.name}`,
  );
  const [deployer] = await hre.ethers.getSigners();

  // Deploying the paymaster
  const paymaster = await deployContract(artifact.contractName, [
    NFT_COLLECTION_ADDRESS,
  ]);
  const paymasterAddress = await paymaster.getAddress();
  console.log(`Paymaster address: ${paymasterAddress}`);

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await fundAccount(deployer, paymasterAddress, "0.005");

  let paymasterBalance = await hre.ethers.provider.getBalance(paymasterAddress);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  // only verify on testnet and mainnet
  if (hre.network.name.includes("ZKsyncEra")) {
    const verificationId = await hre.run("verify:verify", {
      address: paymasterAddress,
      // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
      contract: `${artifact.sourceName}:${artifact.contractName}`,
      constructorArguments: [NFT_COLLECTION_ADDRESS],
    });
    console.log(
      `${artifact.contractName} verified! VerificationId: ${verificationId}`,
    );
  }

  console.log(`Done!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
