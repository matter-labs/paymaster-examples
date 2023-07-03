// here for convenience

export const GREETER_CONTRACT_ABI =
  require("../../../contracts/artifacts-zk/contracts/utils/Greeter.sol/Greeter.json").abi;
export const NFT_CONTRACT_ABI =
  require("../../../contracts/artifacts-zk/contracts/token/ERC721.sol/MyNFT.json").abi;
export const TOKEN_CONTRACT_ABI =
  require("../../../contracts/artifacts-zk/contracts/token/ERC20.sol/MyERC20.json").abi;

export const ERC721_GATED_PAYMASTER = "ERC721Gated Paymaster 🎨";
export const ERC20_GATED_PAYMASTER = "ERC20Fixed Paymaster 🎫";
export const GASLESS_PAYMASTER = "Gasless Paymaster 🆓";
export const ALLOWLIST_PAYMASTER = "Allowlist Paymaster 📜";
