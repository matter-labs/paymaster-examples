import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { TESTNET_EXPLORER_URL } from "../constants/consts";

const TxDetails = ({ txHash, signer, initialSignerBalance }) => {
  const [signerBalanceAfter, setSignerBalanceAfter] = useState(null);
  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await signer.getBalance();
      setSignerBalanceAfter(ethers.utils.formatEther(balance));
    };
    fetchBalance();
  }, [signer]);

  return (
    <div className="ml-8 mt-8">
      <h1 className="text-3xl font-bold mb-4">Transaction details:</h1>
      <p className="text-2xl mb-4">
        Transaction Hash:{" "}
        <a
          href={`${TESTNET_EXPLORER_URL}${txHash}`}
          className="text-blue-500 underline"
        >
          {txHash}
        </a>
      </p>
      <p className="text-2xl mb-4">
        Signer Initial Balance:{" "}
        <span className="font-bold">{initialSignerBalance}</span>{" "}
      </p>
      <p className="text-2xl mb-4">
        Signer Balance After:{" "}
        <span className="font-bold">{signerBalanceAfter}</span>
      </p>
    </div>
  );
};

export default TxDetails;
