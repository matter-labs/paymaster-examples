import React from "react";

const TxDetails = ({ txHash }) => {
  return (
    <div className="ml-8 mt-8">
      <h1 className="text-3xl font-bold mb-4">Transaction details:</h1>
      <p className="text-2xl mb-4">{txHash}</p>
    </div>
  );
};

export default TxDetails;
