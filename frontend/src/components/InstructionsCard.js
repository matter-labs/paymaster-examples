import React from "react";

const InstructionsCard = () => {
  return (
    <div className="p-5 bg-white border-2 border-black rounded-md">
      <h2 className="text-xl font-bold mb-4">
        👋 Welcome to the Paymaster Demo!
      </h2>
      <p className="mb-2">Here's how you can navigate through:</p>
      <ul className="list-disc ml-5 mb-4">
        <li>
          Compile and deploy the paymaster examples following the readme 🚀
        </li>
        <li>Enter your Greeter contract address 📫</li>
        <li>Select your preferred paymaster contract from the dropdown 📜</li>
        <li>Fill in the address 🏢</li>
        <li>
          If you choose ERC20Fixed or ERC721Gated paymasters, provide the Token
          or NFT contract address respectively 🎫🎨
        </li>
        <li>
          Type in your dream Greeter message and press "Change Greeting" 🖊️
        </li>
      </ul>
      <p>Behind the scenes? 🕵️‍♀️</p>
      <p>
        Learn how paymaster works in our docs:{" "}
        <a href="https://era.zksync.io/docs/reference/concepts/aa.html#paymasters">
          here.{" "}
        </a>
        The Gasless paymaster is my favourite! 🆓⛽
      </p>
    </div>
  );
};

export default InstructionsCard;
