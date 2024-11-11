import { fundAccount, deployContract } from "./utils";
import * as hre from "hardhat";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

async function main() {
  const contract = "AllowlistPaymaster";
  const artifact = await hre.ethers.loadArtifact(contract);

  console.log(
    `Running script to deploy ${artifact.contractName} contract on ${hre.network.name}`,
  );

  // Retrieve signers
  const [deployer] = await hre.ethers.getSigners();

  // Deploying the paymaster
  const paymaster = await deployContract(artifact.contractName, []);
  const paymasterAddress = await paymaster.getAddress();
  console.log(`Paymaster address: ${paymasterAddress}`);
  console.log(`Contract owner added to allow list: ${deployer.address}`);

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await fundAccount(deployer, paymasterAddress, "0.005");

  const paymasterBalance = await hre.ethers.provider.getBalance(
    paymasterAddress,
  );
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);
  // only verify on testnet and mainnet
  if (hre.network.name.includes("ZKsyncEra")) {
    const verificationId = await hre.run("verify:verify", {
      address: paymasterAddress,
      // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
      contract: `${artifact.sourceName}:${artifact.contractName}`,
      constructorArguments: [],
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
