import { deployContract } from "./utils";
import * as hre from "hardhat";

// load env file
import dotenv from "dotenv";

dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

async function main() {
  const contract = "Greeter";
  const artifact = await hre.ethers.loadArtifact(contract);
  console.log(
    `Running script to deploy ${artifact.contractName} contract on ${hre.network.name}`,
  );
  const message = "ZK is the endgame";
  // Deploy the contract
  const greeter = await deployContract((await artifact).contractName, [
    message,
  ]);
  const contractAddress = await greeter.getAddress();
  console.log(`Greeter contract address: ${contractAddress}`);

  // Get and log the balance of the recipient
  const greet = await greeter.greet();
  console.log(`Message in contract is: ${greet}`);

  // only verify on testnet and mainnet
  if (hre.network.name.includes("ZKsyncEra")) {
    const verificationId = await hre.run("verify:verify", {
      address: contractAddress,
      // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
      contract: `${artifact.sourceName}:${artifact.contractName}`,
      constructorArguments: [message],
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
