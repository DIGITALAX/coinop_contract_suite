// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CoinOpAccessControl.sol";

contract CoinOpPayment {
    CoinOpAccessControl private _accessControl;
    address[] private _verifiedPaymentTokens;

    mapping(address => bool) private isVerifiedPaymentToken;

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );

    constructor(address _accessControlAddress) {
        _accessControl = CoinOpAccessControl(_accessControlAddress);
    }

    function setVerifiedPaymentTokens(
        address[] memory _paymentTokens
    ) public onlyAdmin {
        for (uint256 i = 0; i < _verifiedPaymentTokens.length; i++) {
            isVerifiedPaymentToken[_verifiedPaymentTokens[i]] = false;
        }
        delete _verifiedPaymentTokens;

        for (uint256 i = 0; i < _paymentTokens.length; i++) {
            isVerifiedPaymentToken[_paymentTokens[i]] = true;
            _verifiedPaymentTokens.push(_paymentTokens[i]);
        }
    }

    function getVerifiedPaymentTokens() public view returns (address[] memory) {
        return _verifiedPaymentTokens;
    }

    function updateAccessControl(
        address _newAccessControlAddress
    ) external onlyAdmin {
        address oldAddress = address(_accessControl);
        _accessControl = CoinOpAccessControl(_newAccessControlAddress);
        emit AccessControlUpdated(
            oldAddress,
            _newAccessControlAddress,
            msg.sender
        );
    }

    function checkIfAddressVerified(
        address _address
    ) public view returns (bool) {
        return isVerifiedPaymentToken[_address];
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }
}
