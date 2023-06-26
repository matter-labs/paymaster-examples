export const updateNFTBalance = async (NFTcontractInstance, signer) => {
  if (NFTcontractInstance && signer) {
    const signerAddress = await signer.getAddress();
    const balance = await NFTcontractInstance.balanceOf(signerAddress);
    return balance;
  }
};
