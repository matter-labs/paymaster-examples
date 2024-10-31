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
  const artifact = "ERC721gatedPaymaster";
  console.log(
    `Running script to deploy ${artifact} contract on ${hre.network.name}`,
  );
  const [deployer] = await hre.ethers.getSigners();

  // Deploying the paymaster
  const paymaster = await deployContract(artifact, [NFT_COLLECTION_ADDRESS]);
  const paymasterAddress = await paymaster.getAddress();
  console.log(`Paymaster address: ${paymasterAddress}`);

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await fundAccount(deployer, paymasterAddress, "0.005");

  let paymasterBalance = await hre.ethers.provider.getBalance(paymasterAddress);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName =
    "contracts/paymasters/ERC721gatedPaymaster.sol:ERC721gatedPaymaster";
  const verificationId = await hre.run("verify:verify", {
    address: paymasterAddress,
    contract: contractFullyQualifedName,
    constructorArguments: [NFT_COLLECTION_ADDRESS],
  });
  console.log(
    `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
  );

  console.log(`Done!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
