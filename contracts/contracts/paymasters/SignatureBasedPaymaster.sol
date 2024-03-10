pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

contract SignatureBasedPaymaster is IPaymaster, Ownable, EIP712 {
    address public signer; 
    mapping(address => uint256) public nonces;
    using ECDSA for bytes32;
    bytes32 public constant SIGNATURE_TYPEHASH = keccak256(
    "SignatureBasedPaymaster(address userAddress,uint256 lastTimestamp,uint256 nonces)"
    );

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "Only bootloader can call this method"
        );
        // Continue execution if called from the bootloader.
        _;
    }

    constructor(address _signer) EIP712("SignatureBasedPaymaster","1") {
        require(_signer != address(0), "Signer cannot be address(0)");
        signer = _signer;
    }

    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        // By default we consider the transaction as accepted.
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        require(
            _transaction.paymasterInput.length >= 4,
            "The standard paymaster input must be at least 4 bytes long"
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {

            (bytes memory innerInputs) = abi.decode(
                _transaction.paymasterInput[4:],
                (bytes)
            );
            (uint lastTimestamp, bytes memory sig) = abi.decode(innerInputs,(uint256,bytes));
            
            // Verify signature expiry based on timestamp. 
            // Timestamp is used in signature hash, hence cannot be faked. 
            require(block.timestamp <= lastTimestamp, "Paymaster: Signature expired");
            // Get user address from transaction.from
            address userAddress = address(uint160(_transaction.from));
            // Generate hash
            bytes32 hash = keccak256(abi.encode(SIGNATURE_TYPEHASH, userAddress,lastTimestamp, nonces[userAddress]++));
            // Hashing with domain separator includes chain id. Hence prevention to signature replay atttacks.
            bytes32 digest = _hashTypedDataV4(hash);
            require(signer == digest.recover(sig),"Paymaster: Invalid signer");
 

            // Note, that while the minimal amount of ETH needed is tx.gasPrice * tx.gasLimit,
            // neither paymaster nor account are allowed to access this context variable.
            uint256 requiredETH = _transaction.gasLimit *
                _transaction.maxFeePerGas;

            // The bootloader never returns any data, so it can safely be ignored here.
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            require(
                success,
                "Failed to transfer tx fee to the bootloader. Paymaster balance might not be enough."
            );
        } else {
            revert("Unsupported paymaster flow");
        }
    }

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {
        // Refunds are not supported yet.
    }
  function withdraw(address _to) external onlyOwner {
        // send paymaster funds to the owner
        (bool success, ) = payable(_to).call{value: address(this).balance}("");
        require(success, "Failed to withdraw funds from paymaster.");

    }

    receive() external payable {}

    function changeSigner(address _signer) onlyOwner public{
        signer = _signer;
    }
    function cancelNonce(address _userAddress) onlyOwner public{
        nonces[_userAddress]++;
    }

    function domainSeparator() public view returns(bytes32){
        return _domainSeparatorV4();
    }
}