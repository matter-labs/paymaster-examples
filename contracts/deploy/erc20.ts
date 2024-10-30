import { deployContract } from "./utils";
import * as hre from "hardhat";

// load env file
import dotenv from "dotenv";

dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
// We will mint the NFTs to this address
const RECIPIENT_ADDRESS = "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

if (!RECIPIENT_ADDRESS)
  throw "⛔️ RECIPIENT_ADDRESS not detected! Add it to the RECIPIENT_ADDRESS variable!";

async function main() {
  const artifact = "MyERC20";
  console.log(
    `Running script to deploy ${artifact} contract on ${hre.network.name}`,
  );
  const name = "MyERC20";
  const symbol = "ERC20";
  const decimals = 18;
  // Deploy the contract
  const contract = await deployContract(artifact, [name, symbol, decimals]);
  const contractAddress = await contract.getAddress();
  console.log(`Token contract address: ${contractAddress}`);

  // Mint token to the recipient address
  const amount = hre.ethers.parseEther("100");
  const tx = await contract.mint(RECIPIENT_ADDRESS, amount);
  console.log(
    `${amount} tokens minted to ${RECIPIENT_ADDRESS}! TxHash: ${tx.hash}`,
  );
  await tx.wait();

  // Get and log the balance of the recipient
  const balance = await contract.balanceOf(RECIPIENT_ADDRESS);
  console.log(`Balance of the recipient: ${balance}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = "contracts/token/ERC20.sol:MyERC20";
  const verificationId = await hre.run("verify:verify", {
    address: contractAddress,
    contract: contractFullyQualifedName,
    constructorArguments: [name, symbol, decimals],
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
