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
  const artifact = "MyNFT";
  console.log(
    `Running script to deploy ${artifact} contract on ${hre.network.name}`,
  );
  // Deploy the contract
  const nftContract = await deployContract(artifact, []);
  const nftAddress = await nftContract.getAddress();
  console.log(`NFT contract address: ${nftAddress}`);

  // Mint NFT to the recipient address
  const tx = await nftContract.createCollectible(RECIPIENT_ADDRESS);
  console.log(`NFT minted to ${RECIPIENT_ADDRESS}! TxHash: ${tx.hash}`);
  await tx.wait();

  // Get and log the balance of the recipient
  const balance = await nftContract.balanceOf(RECIPIENT_ADDRESS);
  console.log(`Balance of the recipient: ${balance}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = "contracts/token/ERC721.sol:MyNFT";
  const verificationId = await hre.run("verify:verify", {
    address: nftAddress,
    contract: contractFullyQualifedName,
    constructorArguments: [],
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
