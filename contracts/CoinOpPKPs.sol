// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";

contract CoinOpPKPs {
    CoinOpAccessControl private _accessControl;
    address[] private _verifiedPaymentTokens;
    address private _pkpAddress;
    string public symbol;
    string public name;

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyPKPOrAdmin() {
        require(
            _accessControl.isAdmin(msg.sender) || msg.sender == _pkpAddress,
            "CoinOpPKPs: Only admin or PKP address can add a user."
        );
        _;
    }

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );
    event PKPAddressUpdated(
        address indexed oldPKPAddress,
        address indexed newPKPAddress,
        address updater
    );
    event UserAdded(string indexed tokenId, address updater);
    event UserRemoved(string indexed tokenId, address updater);

    mapping(string => bool) private _coinOpUsers;

    constructor(
        address _accessControlAddress,
        address _pkpAddressAccount,
        string memory _name,
        string memory _symbol
    ) {
        _accessControl = CoinOpAccessControl(_accessControlAddress);
        symbol = _symbol;
        name = _name;
        _pkpAddress = _pkpAddressAccount;
    }

    function createUserPKPAccount(
        string memory _tokenId
    ) external onlyPKPOrAdmin {
        _coinOpUsers[_tokenId] = true;
        emit UserAdded(_tokenId, msg.sender);
    }

    function removeUserPKPAccount(
        string memory _tokenId
    ) external onlyPKPOrAdmin {
        _coinOpUsers[_tokenId] = false;
        emit UserRemoved(_tokenId, msg.sender);
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

    function updatePKPAddress(address _newPKPAddress) external onlyAdmin {
        address oldAddress = _pkpAddress;
        _pkpAddress = _newPKPAddress;
        emit PKPAddressUpdated(oldAddress, _newPKPAddress, msg.sender);
    }

    function userExists(string memory _tokenId) public view returns (bool) {
        return _coinOpUsers[_tokenId];
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function getPKPAddress() public view returns (address) {
        return _pkpAddress;
    }
}
