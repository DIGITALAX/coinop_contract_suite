// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";

contract CoinOpOracle {
    CoinOpAccessControl private _accessControl;
    string public symbol;
    string public name;
    uint256 private _ethPrice;
    uint256 private _monaPrice;
    uint256 private _maticPrice;
    uint256 private _tetherPrice;
    address private _ethAddress;
    address private _monaAddress;
    address private _tetherAddress;
    address private _maticAddress;

    mapping(address => uint256) private _addressToRate;

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

    event OracleUpdated(
        uint256 _monaPrice,
        uint256 _ethPrice,
        uint256 _maticPrice,
        uint256 _tetherPrice
    );

    constructor(
        address _accessControlContract,
        address _monaTokenAddress,
        address _ethTokenAddress,
        address _maticTokenAddress,
        address _tetherTokenAddress,
        string memory _symbol,
        string memory _name
    ) {
        _accessControl = CoinOpAccessControl(_accessControlContract);
        symbol = _symbol;
        name = _name;
        _monaAddress = _monaTokenAddress;
        _ethAddress = _ethTokenAddress;
        _maticAddress = _maticTokenAddress;
        _tetherAddress = _tetherTokenAddress;
    }

    function setOraclePricesUSD(
        uint256 _newMonaPrice,
        uint256 _newEthPrice,
        uint256 _newMaticPrice,
        uint256 _newTetherPrice
    ) public onlyAdmin {
        _ethPrice = _newEthPrice;
        _monaPrice = _newMonaPrice;
        _tetherPrice = _newTetherPrice;
        _maticPrice = _newMaticPrice;

        _addressToRate[_ethAddress] = _newEthPrice;
        _addressToRate[_monaAddress] = _newMonaPrice;
        _addressToRate[_tetherAddress] = _newTetherPrice;
        _addressToRate[_maticAddress] = _newMaticPrice;

        emit OracleUpdated(
            _newMonaPrice,
            _newEthPrice,
            _newMaticPrice,
            _newTetherPrice
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

    function getMonaPriceUSD() public view returns (uint256) {
        return _monaPrice;
    }

    function getEthPriceUSD() public view returns (uint256) {
        return _ethPrice;
    }

    function getTetherPriceUSD() public view returns (uint256) {
        return _tetherPrice;
    }

    function getMaticPriceUSD() public view returns (uint256) {
        return _maticPrice;
    }

    function getRateByAddress(
        address _tokenAddress
    ) public view returns (uint256) {
        return _addressToRate[_tokenAddress];
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function setMonaAddress(address _address) public onlyAdmin {
        _monaAddress = _address;
    }

    function setEthAddress(address _address) public onlyAdmin {
        _ethAddress = _address;
    }

    function setMaticAddress(address _address) public onlyAdmin {
        _maticAddress = _address;
    }

    function setTetherAddress(address _address) public onlyAdmin {
        _tetherAddress = _address;
    }
}
