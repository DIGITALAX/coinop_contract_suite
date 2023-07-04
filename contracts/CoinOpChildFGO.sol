// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./CoinOpFGOEscrow.sol";
import "./CoinOpAccessControl.sol";
import "./CoinOpParentFGO.sol";

contract CoinOpChildFGO is ERC1155 {
    string public name;
    string public symbol;
    uint256 private _tokenIdPointer;
    CoinOpAccessControl private _accessControl;
    CoinOpFGOEscrow private _fgoEscrow;
    CoinOpParentFGO private _parentFGO;

    struct ChildTemplate {
        uint256 _tokenId;
        string _tokenURI;
        uint256 _amount;
        uint256 _parentId;
        uint256 _fulfillerId;
        uint256 _price;
        address _creator;
    }

    mapping(uint256 => ChildTemplate) private _tokenIdToTemplate;

    event ChildTemplateCreated(uint256 indexed tokenId, string tokenURI);
    event ParentIdAdded(uint256 indexed tokenId, uint256 parentId);
    event ChildBurned(uint256 childTokenId);

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyEscrow() {
        require(
            msg.sender == address(_fgoEscrow),
            "CoinOpAccessControl: Only the Escrow contract can perform this action"
        );
        _;
    }

    modifier onlyParent() {
        require(
            msg.sender == address(_parentFGO),
            "CoinOpAccessControl: Only the Parent contract can perform this action"
        );
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _accessControlContract
    ) ERC1155("") {
        name = _name;
        symbol = _symbol;
        _tokenIdPointer = 0;
        _accessControl = CoinOpAccessControl(_accessControlContract);
    }

    function mint(
        uint256 _amount,
        uint256 _fulfillerId,
        uint256 _price,
        uint256 _parentId,
        string memory _tokenURI,
        address _creator
    ) public onlyParent {
        ++_tokenIdPointer;
        _tokenIdToTemplate[_tokenIdPointer] = ChildTemplate({
            _tokenId: _tokenIdPointer,
            _tokenURI: _tokenURI,
            _amount: _amount,
            _parentId: _parentId,
            _fulfillerId: _fulfillerId,
            _price: _price,
            _creator: _creator
        });

        _mint(address(_fgoEscrow), _tokenIdPointer, _amount, "");
        _fgoEscrow.depositChild(_tokenIdPointer);
        emit ChildTemplateCreated(_tokenIdPointer, _tokenURI);
    }

    function burn(uint256 _id, uint256 _amount) public onlyEscrow {
        delete _tokenIdToTemplate[_id];

        _burn(msg.sender, _id, _amount);

        emit ChildBurned(_id);
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return _tokenIdToTemplate[_id]._tokenURI;
    }

    function tokenExists(
        uint256 _childTokenId
    ) public view returns (bool success) {
        if (_childTokenId > _tokenIdPointer || _childTokenId == 0) {
            return false;
        } else {
            return true;
        }
    }

    function setParentId(
        uint256 _tokenId,
        uint256 _parentId
    ) external onlyEscrow {
        _tokenIdToTemplate[_tokenId]._parentId = _parentId;

        emit ParentIdAdded(_tokenId, _parentId);
    }

    function setFGOEscrow(address _newEscrowAddress) public onlyAdmin {
        _fgoEscrow = CoinOpFGOEscrow(_newEscrowAddress);
    }

    function setParentFGO(address _newParentAddress) public onlyAdmin {
        _parentFGO = CoinOpParentFGO(_newParentAddress);
    }

    function updateAccessControl(address _newAccessControl) public onlyAdmin {
        _accessControl = CoinOpAccessControl(_newAccessControl);
    }

    function getFGOParent() public view returns (address) {
        return address(_parentFGO);
    }

    function getFGOEscrow() public view returns (address) {
        return address(_fgoEscrow);
    }

    function getAccessControl() public view returns (address) {
        return address(_accessControl);
    }

    function getChildTokenURI(
        uint256 _tokenId
    ) public view returns (string memory) {
        return _tokenIdToTemplate[_tokenId]._tokenURI;
    }

    function getChildTokenAmount(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _tokenIdToTemplate[_tokenId]._amount;
    }

    function getChildFulfillerId(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _tokenIdToTemplate[_tokenId]._fulfillerId;
    }

    function getChildCreator(uint256 _tokenId) public view returns (address) {
        return _tokenIdToTemplate[_tokenId]._creator;
    }

    function getChildPrice(uint256 _tokenId) public view returns (uint256) {
        return _tokenIdToTemplate[_tokenId]._price;
    }

    function getChildTokenParentId(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _tokenIdToTemplate[_tokenId]._parentId;
    }

    function getTokenPointer() public view returns (uint256) {
        return _tokenIdPointer;
    }
}
