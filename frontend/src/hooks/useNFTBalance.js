import { useState, useEffect } from "react";

const useNFTBalance = (NFTcontractInstance, signer) => {
  const [nftBalance, setNftBalance] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function getNftBalance() {
      if (mounted && NFTcontractInstance && signer) {
        const signerAddress = await signer.getAddress();
        const balance = await NFTcontractInstance.balanceOf(signerAddress);
        setNftBalance(balance);
      }
    }

    getNftBalance();

    return () => {
      mounted = false;
    };
  }, [NFTcontractInstance, signer]);

  return nftBalance;
};

export default useNFTBalance;
