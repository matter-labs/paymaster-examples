import { Contract, Signer } from "zksync-ethers";
import * as ethers from "ethers";
import * as hre from "hardhat";

async function deployContract(
  artifact: string,
  params: any[],
): Promise<Contract> {
  const contractFactory = await hre.ethers.getContractFactory(artifact);
  const contract = await contractFactory.deploy(...params);
  return contract;
}

async function fundAccount(wallet: Signer, address: string, amount: string) {
  // fund account
  await (
    await wallet.sendTransaction({
      to: address,
      value: ethers.parseEther(amount),
    })
  ).wait();

  console.log(`Account ${address} funded with ${amount}`);
}

export { deployContract, fundAccount };
