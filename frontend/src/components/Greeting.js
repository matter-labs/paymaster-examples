import React from "react";

const Greeting = ({ greeting }) => {
  return (
    <div className="ml-8 mt-8">
      <h1 className="text-4xl font-bold mb-4">Greeter says:</h1>
      <p className="text-2xl mb-4">{greeting} 👋</p>
    </div>
  );
};

export default Greeting;
