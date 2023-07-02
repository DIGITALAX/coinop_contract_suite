// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CoinOpChildFGO.sol";
import "./CoinOpAccessControl.sol";
import "./CoinOpFGOEscrow.sol";

contract CoinOpParentFGO is ERC721 {
    uint256 private _totalSupply;
    CoinOpChildFGO private _childFGO;
    CoinOpAccessControl private _accessControl;
    CoinOpFGOEscrow private _fgoEscrow;

    struct ParentTemplate {
        uint256 _tokenId;
        string _tokenURI;
        uint256[] _childTokenIds;
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

    constructor(address _childContract) ERC721("CoinOpParentFGO", "PFGO") {
        _totalSupply = 0;
        _childFGO = CoinOpChildFGO(_childContract);
    }

    function mintFGO(
        string memory _parentURI,
        string[] memory _childURIs
    ) public onlyAdmin {
        ++_totalSupply;

        uint256 tokenPointer = _childFGO.getTokenPointer();
        uint256[] memory _childTokenIds = new uint256[](_childURIs.length);

        for (uint256 i = 0; i < _childURIs.length; i++) {
            _childTokenIds[i] = tokenPointer + i + 1;
        }

        _tokenIdToTemplate[_totalSupply] = ParentTemplate({
            _tokenId: _totalSupply,
            _tokenURI: _parentURI,
            _childTokenIds: _childTokenIds
        });

        for (uint256 i; i < _childURIs.length; i++) {
            _childFGO.mint(1, _childURIs[i]);
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
        for (uint256 i; i < _childTokenIds.length; i++) {
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

    function getFGOChild() public view returns (address) {
        return address(_childFGO);
    }

    function getFGOEscrow() public view returns (address) {
        return address(_fgoEscrow);
    }

    function getAccessControl() public view returns (address) {
        return address(_accessControl);
    }
}
