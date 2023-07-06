// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";
import "./CoinOpMarket.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CustomCompositeNFT is ERC721Enumerable {
    CoinOpAccessControl private _accessControl;
    CoinOpMarket private _coinOpMarket;
    uint256 private _totalSupplyCount;

    struct Token {
        uint256 tokenId;
        uint256 price;
        uint256 productId;
        uint256 timestamp;
        uint256 fulfillerId;
        address acceptedToken;
        address creator;
        string uri;
        bool isBurned;
    }

    mapping(uint256 => Token) private _tokens;

    event BatchTokenMinted(address indexed to, uint256[] tokenIds, string uri);
    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );
    event MarketUpdated(
        address indexed oldMarket,
        address indexed newMarket,
        address updater
    );

    event TokenBurned(uint256 indexed tokenId);

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyMarket() {
        require(
            msg.sender == address(_coinOpMarket),
            "CustomCompositeNFT: Only Market contract can perform this action"
        );
        _;
    }

    constructor(
        address _accessControlAddress
    ) ERC721("CustomCompositeNFT", "CHRON") {
        _accessControl = CoinOpAccessControl(_accessControlAddress);
        _totalSupplyCount = 0;
    }

    function mint(
        address _acceptedToken,
        address _creatorAddress,
        uint256 _price,
        uint256 _amount,
        uint256 _fulfillerId,
        uint256 _productId,
        string memory _uri
    ) public onlyMarket {
        uint256[] memory tokenIds = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            _totalSupplyCount++;
            _mintToken(
                _acceptedToken,
                _creatorAddress,
                _price,
                _fulfillerId,
                _productId,
                _uri
            );
            tokenIds[i] = _totalSupplyCount;
            _safeMint(_creatorAddress, _totalSupplyCount);
        }

        emit BatchTokenMinted(_creatorAddress, tokenIds, _uri);
    }

    function _mintToken(
        address _acceptedToken,
        address _creatorAddress,
        uint256 _price,
        uint256 _fulfillerId,
        uint256 _productId,
        string memory _uri
    ) private {
        Token memory newToken = Token({
            tokenId: _totalSupplyCount,
            acceptedToken: _acceptedToken,
            price: _price,
            productId: _productId,
            creator: _creatorAddress,
            uri: _uri,
            isBurned: false,
            timestamp: block.timestamp,
            fulfillerId: _fulfillerId
        });
        _tokens[_totalSupplyCount] = newToken;
    }

    function burnBatch(uint256[] memory _tokenIds) public {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(
                msg.sender == ownerOf(_tokenIds[i]),
                "ERC721Metadata: Only token owner can burn tokens"
            );
        }

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            burn(_tokenIds[i]);
        }
    }

    function burn(uint256 _tokenId) public {
        require(
            msg.sender == ownerOf(_tokenId),
            "ERC721Metadata: Only token owner can burn token"
        );
        _burn(_tokenId);
        _tokens[_tokenId].isBurned = true;
        emit TokenBurned(_tokenId);
    }

    function updateAccessControl(
        address _newAccessControlAddress
    ) public onlyAdmin {
        address oldAddress = address(_accessControl);
        _accessControl = CoinOpAccessControl(_newAccessControlAddress);
        emit AccessControlUpdated(
            oldAddress,
            _newAccessControlAddress,
            msg.sender
        );
    }

    function setCoinOpMarket(address _newMarketAddress) public onlyAdmin {
        address oldAddress = address(_coinOpMarket);
        _coinOpMarket = CoinOpMarket(_newMarketAddress);
        emit MarketUpdated(oldAddress, _newMarketAddress, msg.sender);
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        return _tokens[_tokenId].uri;
    }

    function getTotalSupplyCount() public view returns (uint256) {
        return _totalSupplyCount;
    }

    function getTokenCreator(uint256 _tokenId) public view returns (address) {
        return _tokens[_tokenId].creator;
    }

    function getTokenAcceptedToken(
        uint256 _tokenId
    ) public view returns (address) {
        return _tokens[_tokenId].acceptedToken;
    }

    function getTokenPrice(uint256 _tokenId) public view returns (uint256) {
        return _tokens[_tokenId].price;
    }

    function getTokenIsBurned(uint256 _tokenId) public view returns (bool) {
        return _tokens[_tokenId].isBurned;
    }

    function getTokenTimestamp(uint256 _tokenId) public view returns (uint256) {
        return _tokens[_tokenId].timestamp;
    }

    function getTokenId(uint256 _tokenId) public view returns (uint256) {
        return _tokens[_tokenId].tokenId;
    }

    function getTokenFulfillerId(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _tokens[_tokenId].fulfillerId;
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function getMarketContract() public view returns (address) {
        return address(_coinOpMarket);
    }
}
