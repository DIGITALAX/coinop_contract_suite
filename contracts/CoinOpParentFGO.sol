// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CoinOpChildFGO.sol";
import "./CoinOpAccessControl.sol";
import "./CoinOpFGOEscrow.sol";
import "./CoinOpPayment.sol";
import "./CoinOpFulfillment.sol";

contract CoinOpParentFGO is ERC721 {
    uint256 private _totalSupply;
    CoinOpChildFGO private _childFGO;
    CoinOpAccessControl private _accessControl;
    CoinOpFGOEscrow private _fgoEscrow;
    CoinOpFulfillment private _fulfillment;
    CoinOpPayment private _payment;

    struct ParentTemplate {
        uint256 _tokenId;
        uint256 _fulfillerId;
        uint256[] _childTokenIds;
        uint256[] _prices;
        string _tokenURI;
        string _printType;
        address[] _acceptedTokens;
        address _creator;
    }

    mapping(uint256 => ParentTemplate) private _tokenIdToTemplate;

    event FGOTemplateCreated(
        uint indexed parentTokenId,
        string parentURI,
        uint256[] childTokenIds,
        string[] childTokenURIs
    );

    event ParentBurned(uint indexed parentTokenId);

    modifier childTokensModifier(uint256[] calldata _childTokenIds) {
        _verifyChildTokens(_childTokenIds);
        _;
    }

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

    constructor(
        address _childContract,
        address _paymentContract,
        address _fulfillmentContract
    ) ERC721("CoinOpParentFGO", "PFGO") {
        _totalSupply = 0;
        _childFGO = CoinOpChildFGO(_childContract);
        _payment = CoinOpPayment(_paymentContract);
        _fulfillment = CoinOpFulfillment(_fulfillmentContract);
    }

    function mintFGO(
        string memory _parentURI,
        string memory _printType,
        string[] memory _childURIs,
        address[] memory _acceptedTokens,
        address[][] memory _childAcceptedTokens,
        uint256[] memory _prices,
        uint256[][] memory _childPrices,
        uint256 _fulfillerId
    ) public onlyAdmin {
        require(
            _prices.length == _acceptedTokens.length,
            "CoinOpParentFGO: Prices and Accepted Tokens must be the same length."
        );
        require(
            _fulfillment.getFulfillerAddress(_fulfillerId) != address(0),
            "CoinOpFulfillment: Fulfiller Id is not valid."
        );
        for (uint256 i = 0; i < _acceptedTokens.length; i++) {
            require(
                _payment.checkIfAddressVerified(_acceptedTokens[i]),
                "CoinOpPayment: Payment Token is Not Verified."
            );
        }

        ++_totalSupply;

        uint256 tokenPointer = _childFGO.getTokenPointer();
        uint256[] memory _childTokenIds = new uint256[](_childURIs.length);

        for (uint256 i = 0; i < _childURIs.length; i++) {
            _childTokenIds[i] = tokenPointer + i + 1;
        }

        _tokenIdToTemplate[_totalSupply] = ParentTemplate({
            _tokenId: _totalSupply,
            _fulfillerId: _fulfillerId,
            _tokenURI: _parentURI,
            _childTokenIds: _childTokenIds,
            _acceptedTokens: _acceptedTokens,
            _prices: _prices,
            _printType: _printType,
            _creator: msg.sender
        });

        for (uint256 i = 0; i < _childURIs.length; i++) {
            _childFGO.mint(
                1,
                _fulfillerId,
                _childPrices[i],
                _childURIs[i],
                _childAcceptedTokens[i],
                msg.sender
            );
        }

        _safeMint(msg.sender, _totalSupply);

        emit FGOTemplateCreated(
            _totalSupply,
            _parentURI,
            _childTokenIds,
            _childURIs
        );
    }

    function _verifyChildTokens(uint256[] memory _childTokenIds) internal view {
        for (uint256 i = 0; i < _childTokenIds.length; i++) {
            require(
                _childFGO.tokenExists(_childTokenIds[i]),
                "CoinOpChildFGO: Token does not exist."
            );
        }
    }

    function burn(uint256 _tokenId) public onlyEscrow {
        delete _tokenIdToTemplate[_tokenId];
        _burn(_tokenId);
        emit ParentBurned(_tokenId);
    }

    function setChildTokenIds(
        uint256 _parentTokenId,
        uint256[] memory _childTokenIds
    ) public onlyEscrow {
        _tokenIdToTemplate[_parentTokenId]._childTokenIds = _childTokenIds;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        return _tokenIdToTemplate[_tokenId]._tokenURI;
    }

    function getParentChildTokens(
        uint256 _tokenId
    ) public view virtual returns (uint256[] memory) {
        return _tokenIdToTemplate[_tokenId]._childTokenIds;
    }

    function getParentCreator(
        uint256 _tokenId
    ) public view virtual returns (address) {
        return _tokenIdToTemplate[_tokenId]._creator;
    }

    function getParentFulfillerId(
        uint256 _tokenId
    ) public view virtual returns (uint256) {
        return _tokenIdToTemplate[_tokenId]._fulfillerId;
    }

    function getParentAcceptedTokens(
        uint256 _tokenId
    ) public view virtual returns (address[] memory) {
        return _tokenIdToTemplate[_tokenId]._acceptedTokens;
    }

    function getParentPrices(
        uint256 _tokenId
    ) public view virtual returns (uint256[] memory) {
        return _tokenIdToTemplate[_tokenId]._prices;
    }

    function getParentPrintType(
        uint256 _tokenId
    ) public view virtual returns (string memory) {
        return _tokenIdToTemplate[_tokenId]._printType;
    }

    function getTotalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function setFGOEscrow(address _newEscrowAddress) public onlyAdmin {
        _fgoEscrow = CoinOpFGOEscrow(_newEscrowAddress);
    }

    function setChildFGO(address _newChildAddress) public onlyAdmin {
        _childFGO = CoinOpChildFGO(_newChildAddress);
    }

    function updateAccessControl(address _newAccessControl) public onlyAdmin {
        _accessControl = CoinOpAccessControl(_newAccessControl);
    }

    function updatePayment(address _newPayment) public onlyAdmin {
        _payment = CoinOpPayment(_newPayment);
    }

    function updateFulfillment(address _newFulfillment) public onlyAdmin {
        _fulfillment = CoinOpFulfillment(_newFulfillment);
    }

    function getFGOChild() public view returns (address) {
        return address(_childFGO);
    }

    function getFGOEscrow() public view returns (address) {
        return address(_fgoEscrow);
    }

    function getAccessControl() public view returns (address) {
        return address(_accessControl);
    }

    function getPayment() public view returns (address) {
        return address(_payment);
    }

    function getFulfiller() public view returns (address) {
        return address(_fulfillment);
    }
}
