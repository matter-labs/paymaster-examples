import { fundAccount } from "./utils";
import * as hre from "hardhat";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

async function main() {
  const artifact = "AllowlistPaymaster";
  console.log(
    `Running script to deploy ${artifact} contract on ${hre.network.name}`,
  );

  // Retrieve signers
  const [deployer] = await hre.ethers.getSigners();

  // Deploying the paymaster
  const paymasterFactory = await hre.ethers.getContractFactory(artifact);
  const paymaster = await paymasterFactory.deploy([]);
  const paymasterAddress = await paymaster.getAddress();
  console.log(`Paymaster address: ${paymasterAddress}`);
  console.log(`Contract owner added to allow list: ${deployer.address}`);

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await fundAccount(deployer, paymasterAddress, "0.005");

  let paymasterBalance = await hre.ethers.provider.getBalance(paymasterAddress);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName =
    "contracts/paymasters/AllowlistPaymaster.sol:AllowlistPaymaster";
  const verificationId = await hre.run("verify:verify", {
    address: paymasterAddress,
    contract: contractFullyQualifedName,
    constructorArguments: [],
    // bytecode: paymasterArtifact.bytecode,
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
