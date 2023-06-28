import React from "react";

const Check = ({ hasInfinityStones }) => {
  return (
    <>
      {hasInfinityStones ? (
        <p className="text-2xl mb-4">🪐 You have an Infinity Stone!</p>
      ) : (
        <p className="text-2xl mb-4">😢 You don't have an Infinity Stone.</p>
      )}
    </>
  );
};

export default Check;
