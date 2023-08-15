// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";

contract CoinOpPreludePoints {
    CoinOpAccessControl private _accessControl;
    address[] private _verifiedPaymentTokens;
    string public symbol;
    string public name;

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

    event PaymentTokensUpdated(address[] newPaymentTokens);

    constructor(
        address _accessControlAddress,
        string memory _name,
        string memory _symbol
    ) {
        _accessControl = CoinOpAccessControl(_accessControlAddress);
        symbol = _symbol;
        name = _name;
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

        emit PaymentTokensUpdated(_verifiedPaymentTokens);
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
