import React from "react";

const Greeting = ({ greeting }) => {
  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Greeter says:</h1>
      <p className="text-2xl mb-4">{greeting}👋</p>
      <p className="text-lg mb-4 mx-auto text-center max-w-xl px-4">
        This is a simple dApp, where if the user possesses an applicable NFT
        they can interact with the Greeter contract and transaction fees are
        covered by paymaster.
      </p>
    </>
  );
};

export default Greeting;
