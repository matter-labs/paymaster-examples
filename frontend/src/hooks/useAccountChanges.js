import { useEffect } from "react";
import { Web3Provider, Contract } from "zksync-web3";
import {
  GREETER_CONTRACT_ADDRESS,
  GREETER_CONTRACT_ABI,
  INFINITY_CONTRACT_ADDRESS,
  INFINITY_CONTRACT_ABI,
} from "../constants/consts";

const useAccountChanges = (
  setProvider,
  setSigner,
  setContractInstance,
  setNFTContractInstance,
  updateGreeting,
  updateNftBalance,
) => {
  useEffect(() => {
    // Listen for accountsChanged event
    window.ethereum.on("accountsChanged", async (accounts) => {
      const provider = new Web3Provider(window.ethereum);
      setProvider(provider);

      const signerInstance = provider.getSigner();
      setSigner(signerInstance);

      const contract = new Contract(
        GREETER_CONTRACT_ADDRESS,
        GREETER_CONTRACT_ABI,
        signerInstance,
      );
      setContractInstance(contract);

      const NFT_contract = new Contract(
        INFINITY_CONTRACT_ADDRESS,
        INFINITY_CONTRACT_ABI,
        signerInstance,
      );
      setNFTContractInstance(NFT_contract);

      await updateGreeting(contract);
      await updateNftBalance();
    });
  }, [
    setProvider,
    setSigner,
    setContractInstance,
    setNFTContractInstance,
    updateGreeting,
    updateNftBalance,
  ]);
};

export default useAccountChanges;
