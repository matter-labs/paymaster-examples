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
  const artifact = "Greeter";
  console.log(
    `Running script to deploy ${artifact} contract on ${hre.network.name}`,
  );
  const message = "ZK is the endgame";
  // Deploy the contract
  const contract = await deployContract(artifact, [message]);
  const contractAddress = await contract.getAddress();
  console.log(`NFT contract address: ${contractAddress}`);

  // Get and log the balance of the recipient
  const greet = await contract.greet();
  console.log(`Message in contract is: ${greet}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = "contracts/utils/Greeter.sol:Greeter";
  const verificationId = await hre.run("verify:verify", {
    address: contractAddress,
    contract: contractFullyQualifedName,
    constructorArguments: [message],
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
