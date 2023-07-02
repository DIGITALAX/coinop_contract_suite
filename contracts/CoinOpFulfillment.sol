// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CoinOpFulfillment {
    CoinOpAccessControl private _accessControl;
    uint256 private _fullfillerCount;
    string public symbol;
    string public name;

    struct Fulfiller {
        uint256 fulfillerId;
        uint256 fulfillerPercent;
        address fulfillerAddress;
    }

    mapping(uint256 => Fulfiller) private _fulfillers;

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );

    event OrderCreated(
        uint256 indexed orderId,
        address buyer,
        string fulfillmentInformation
    );

    event FulfillerAddressUpdated(
        uint256 indexed fulfillerId,
        address newFulfillerAddress
    );

    event FulfillerCreated(
        uint256 indexed fulfillerId,
        uint256 fulfillerPercent,
        address fulfillerAddress
    );

    event FulfillerPercentUpdated(
        uint256 indexed fulfillerId,
        uint256 newFulfillerPercent
    );

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyFulfiller(uint256 _fulfillerId) {
        require(
            msg.sender == _fulfillers[_fulfillerId].fulfillerAddress,
            "CoinOpFulfillment: Only the fulfiller can update."
        );
        _;
    }

    constructor(
        address _accessControlContract,
        string memory _symbol,
        string memory _name
    ) {
        _accessControl = CoinOpAccessControl(_accessControlContract);
        symbol = _symbol;
        name = _name;
        _fullfillerCount = 0;
    }

    function createFulfiller(
        uint256 _fulfillerPercent,
        address _fulfillerAddress
    ) external onlyAdmin {
        require(
            _fulfillerPercent < 100,
            "CoinOpFulfillment: Percent can not be greater than 100."
        );
        _fullfillerCount++;

        Fulfiller memory newFulfiller = Fulfiller({
            fulfillerId: _fullfillerCount,
            fulfillerPercent: _fulfillerPercent,
            fulfillerAddress: _fulfillerAddress
        });

        _fulfillers[_fullfillerCount] = newFulfiller;

        emit FulfillerCreated(
            _fullfillerCount,
            _fulfillerPercent,
            _fulfillerAddress
        );
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

    function updateFulfillerPercent(
        uint256 _fulfillerId,
        uint256 _fulfillerPercent
    ) public onlyFulfiller(_fulfillerId) {
        require(
            _fulfillerId <= _fullfillerCount,
            "CoinOpFulfillment: Fulfiller does not exist."
        );
        _fulfillers[_fulfillerId].fulfillerPercent = _fulfillerPercent;
        emit FulfillerPercentUpdated(_fulfillerId, _fulfillerPercent);
    }

    function getFulfillerPercent(
        uint256 _fulfillerId
    ) public view returns (uint256) {
        return _fulfillers[_fulfillerId].fulfillerPercent;
    }

    function updateFulfillerAddress(
        uint256 _fulfillerId,
        address _fulfillerAddress
    ) public onlyFulfiller(_fulfillerId) {
        require(
            _fulfillerId <= _fullfillerCount,
            "CoinOpFulfillment: Fulfiller does not exist."
        );
        _fulfillers[_fulfillerId].fulfillerAddress = _fulfillerAddress;
        emit FulfillerAddressUpdated(_fulfillerId, _fulfillerAddress);
    }

    function getFulfillerAddress(
        uint256 _fulfillerId
    ) public view returns (address) {
        return _fulfillers[_fulfillerId].fulfillerAddress;
    }

    function getFulfillerCount() public view returns (uint256) {
        return _fullfillerCount;
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }
}
