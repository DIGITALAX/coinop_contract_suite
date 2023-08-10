// SPDX-License-Identifier: UNLICENSE

import "./CoinOpMarket.sol";
import "./CoinOpAccessControl.sol";
import "./CoinOpFulfillment.sol";
import "./CoinOpPayment.sol";
import "./PreRollNFT.sol";

pragma solidity ^0.8.9;

library MintParamsLibrary {
    struct MintParams {
        uint256[] price;
        uint256 fulfillerId;
        uint256 discount;
        string name;
        string uri;
        string printType;
    }
}

contract PreRollCollection {
    using MintParamsLibrary for MintParamsLibrary.MintParams;

    PreRollNFT private _preRollNFT;
    CoinOpFulfillment private _coinOpFulfillment;
    CoinOpAccessControl private _accessControl;
    CoinOpPayment private _coinOpPayment;
    CoinOpMarket private _coinOpMarket;
    uint256 private _collectionSupply;
    string public symbol;
    string public name;

    struct Collection {
        uint256[] price;
        uint256[] tokenIds;
        uint256 collectionId;
        uint256 amount;
        uint256 timestamp;
        uint256 mintedTokens;
        uint256 index;
        address creator;
        string uri;
        string name;
        bool isDeleted;
        bool noLimit;
    }

    mapping(uint256 => Collection) private _collections;
    mapping(uint256 => uint256) private _fulfillerId;
    mapping(uint256 => string) private _printType;
    mapping(uint256 => uint256) private _discount;

    event TokensMinted(
        uint256 indexed collectionId,
        string uri,
        uint256 amountMinted,
        uint256[] tokenIdsMinted,
        address owner
    );

    event CollectionCreated(
        uint256 indexed collectionId,
        string uri,
        uint256 amount,
        address owner
    );

    event CollectionDeleted(address sender, uint256 indexed collectionId);

    event CollectionAdded(
        uint256 indexed collectionId,
        uint256 amount,
        address owner
    );

    event CollectionURIUpdated(
        uint256 indexed collectionId,
        string oldURI,
        string newURI,
        address updater
    );

    event CollectionPriceUpdated(
        uint256 indexed collectionId,
        uint256[] oldPrice,
        uint256[] newPrice,
        address updater
    );

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );

    event PreRollNFTUpdated(
        address indexed oldPreRollNFT,
        address indexed newPreRollNFT,
        address updater
    );

    event CoinOpFulfillmentUpdated(
        address indexed oldCoinOpFulfillment,
        address indexed newCoinOpFulfillment,
        address updater
    );

    event CoinOpPaymentUpdated(
        address indexed oldCoinOpPayment,
        address indexed newCoinOpPayment,
        address updater
    );

    event CoinOpMarketUpdated(
        address indexed oldCoinOpMarket,
        address indexed newCoinOpMarket,
        address updater
    );

    event CollectionFulfillerIdUpdated(
        uint256 indexed collectionId,
        uint256 oldFulfillerId,
        uint256 newFulfillerId,
        address updater
    );

    event CollectionPrintTypeUpdated(
        uint256 indexed collectionId,
        string oldPrintType,
        string newPrintType,
        address updater
    );

    event CollectionNameUpdated(
        uint256 indexed collectionId,
        string oldName,
        string newName,
        address updater
    );

    event CollectionDiscountUpdated(
        uint256 indexed collectionId,
        uint256 discount,
        address updater
    );

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyCreator(uint256 _collectionId) {
        require(
            msg.sender == _collections[_collectionId].creator,
            "PreRollCollection: Only the creator can edit this collection"
        );
        _;
    }

    modifier onlyMarket() {
        require(
            msg.sender == address(_coinOpMarket),
            "PreRollCollection: Only the market contract can call purchase"
        );
        _;
    }

    constructor(
        address _preRollNFTAddress,
        address _accessControlAddress,
        address _coinOpPaymentAddress,
        string memory _symbol,
        string memory _name
    ) {
        _preRollNFT = PreRollNFT(_preRollNFTAddress);
        _accessControl = CoinOpAccessControl(_accessControlAddress);
        _coinOpPayment = CoinOpPayment(_coinOpPaymentAddress);
        _collectionSupply = 0;
        symbol = _symbol;
        name = _name;
    }

    function createCollection(
        uint256 _amount,
        MintParamsLibrary.MintParams memory params,
        bool _noLimit
    ) external {
        address _creator = msg.sender;
        require(
            _accessControl.isAdmin(_creator) ||
                _accessControl.isWriter(_creator),
            "PreRollCollection: Only admin or writer can perform this action"
        );
        require(
            _coinOpFulfillment.getFulfillerAddress(params.fulfillerId) !=
                address(0),
            "CoinOpFulfillment: FulfillerId does not exist."
        );

        _collectionSupply++;

        if (_noLimit) {
            _amount = type(uint256).max;
        }

        _createNewCollection(params, _amount, _creator, _noLimit);

        _setMappings(params);

        emit CollectionCreated(
            _collectionSupply,
            params.uri,
            _amount,
            _creator
        );
    }

    function addToExistingCollection(
        uint256 _collectionId,
        uint256 _amount
    ) external {
        address _creator = msg.sender;
        require(
            _collections[_collectionId].amount != type(uint256).max,
            "PreRollCollection: Collection cannot be added to."
        );

        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted"
        );
        require(
            _collections[_collectionId].collectionId != 0,
            "PreRollCollection: Collection does not exist"
        );

        require(
            _accessControl.isAdmin(_creator) ||
                _accessControl.isWriter(_creator),
            "PreRollCollection: Only admin or writer can perform this action"
        );
        require(
            _collections[_collectionId].creator == _creator,
            "PreRollCollection: Only the owner of a collection can add to it."
        );

        _collections[_collectionId].amount += _amount;

        emit CollectionAdded(_collectionId, _amount, _creator);
    }

    function _setMappings(MintParamsLibrary.MintParams memory params) private {
        _printType[_collectionSupply] = params.printType;
        _fulfillerId[_collectionSupply] = params.fulfillerId;
        _discount[_collectionSupply] = params.discount;
    }

    function _createNewCollection(
        MintParamsLibrary.MintParams memory params,
        uint256 _amount,
        address _creatorAddress,
        bool _noLimit
    ) private {
        Collection memory newCollection = Collection({
            collectionId: _collectionSupply,
            price: params.price,
            index: 0,
            tokenIds: new uint256[](0),
            amount: _amount,
            mintedTokens: 0,
            creator: _creatorAddress,
            uri: params.uri,
            name: params.name,
            isDeleted: false,
            noLimit: _noLimit,
            timestamp: block.timestamp
        });

        _collections[_collectionSupply] = newCollection;
    }

    function _mintNFT(
        Collection memory _collection,
        uint256 _amount,
        uint256 _collectionId,
        uint256 _chosenIndex,
        address _creatorAddress,
        address _purchaserAddress,
        address _acceptedToken
    ) private {
        MintParamsLibrary.MintParams memory paramsNFT = MintParamsLibrary
            .MintParams({
                price: _collection.price,
                uri: _collection.uri,
                printType: _printType[_collection.collectionId],
                fulfillerId: _fulfillerId[_collection.collectionId],
                discount: _discount[_collection.collectionId],
                name: _collection.name
            });

        _preRollNFT.mintBatch(
            paramsNFT,
            _amount,
            _collectionId,
            _chosenIndex,
            _creatorAddress,
            _purchaserAddress,
            _acceptedToken
        );
    }

    function purchaseAndMintToken(
        uint256 _collectionId,
        uint256 _amount,
        uint256 _chosenIndex,
        address _purchaserAddress,
        address _acceptedToken
    ) external onlyMarket {
        require(
            _coinOpPayment.checkIfAddressVerified(_acceptedToken),
            "CoinOpPayment: Not a valid accepted purchase token."
        );

        Collection storage collection = _collections[_collectionId];

        require(
            !collection.isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        require(
            collection.amount == type(uint256).max ||
                collection.mintedTokens + _amount <= collection.amount,
            "PreRollCollection: Cannot mint more than collection amount"
        );

        uint256 initialSupply = _preRollNFT.getTotalSupplyCount();

        _mintNFT(
            _collections[_collectionId],
            _amount,
            _collectionId,
            _chosenIndex,
            collection.creator,
            _purchaserAddress,
            _acceptedToken
        );

        uint256[] memory newTokenIds = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            uint256 tokenId = initialSupply + i + 1;
            newTokenIds[i] = tokenId;
            collection.mintedTokens++;
        }

        collection.tokenIds = _concatenate(collection.tokenIds, newTokenIds);
        collection.index = _chosenIndex;

        emit TokensMinted(
            collection.collectionId,
            collection.uri,
            _amount,
            newTokenIds,
            collection.creator
        );
    }

    function _concatenate(
        uint256[] memory _originalArray,
        uint256[] memory _newArray
    ) internal pure returns (uint256[] memory) {
        uint256[] memory result = new uint256[](
            _originalArray.length + _newArray.length
        );
        uint256 i;
        for (i = 0; i < _originalArray.length; i++) {
            result[i] = _originalArray[i];
        }
        for (uint256 j = 0; j < _newArray.length; j++) {
            result[i++] = _newArray[j];
        }
        return result;
    }

    function deleteCollection(
        uint256 _collectionId
    ) public onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has already been deleted."
        );

        Collection storage collection = _collections[_collectionId];

        if (collection.mintedTokens == 0) {
            delete _collections[_collectionId];
        } else {
            collection.amount = collection.mintedTokens;
        }
        collection.isDeleted = true;

        emit CollectionDeleted(msg.sender, _collectionId);
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

    function updatePreRollNFT(
        address _newPreRollNFTAddress
    ) external onlyAdmin {
        address oldAddress = address(_preRollNFT);
        _preRollNFT = PreRollNFT(_newPreRollNFTAddress);
        emit PreRollNFTUpdated(oldAddress, _newPreRollNFTAddress, msg.sender);
    }

    function updateCoinOpPayment(
        address _newCoinOpPaymentAddress
    ) external onlyAdmin {
        address oldAddress = address(_coinOpPayment);
        _coinOpPayment = CoinOpPayment(_newCoinOpPaymentAddress);
        emit CoinOpPaymentUpdated(
            oldAddress,
            _newCoinOpPaymentAddress,
            msg.sender
        );
    }

    function setCoinOpMarket(
        address _newCoinOpMarketAddress
    ) external onlyAdmin {
        address oldAddress = address(_coinOpMarket);
        _coinOpMarket = CoinOpMarket(_newCoinOpMarketAddress);
        emit CoinOpMarketUpdated(
            oldAddress,
            _newCoinOpMarketAddress,
            msg.sender
        );
    }

    function setCoinOpFulfillment(
        address _newCoinOpFulfillmentAddress
    ) external onlyAdmin {
        address oldAddress = address(_coinOpFulfillment);
        _coinOpFulfillment = CoinOpFulfillment(_newCoinOpFulfillmentAddress);
        emit CoinOpFulfillmentUpdated(
            oldAddress,
            _newCoinOpFulfillmentAddress,
            msg.sender
        );
    }

    function getCollectionCreator(
        uint256 _collectionId
    ) public view returns (address) {
        return _collections[_collectionId].creator;
    }

    function getCollectionURI(
        uint256 _collectionId
    ) public view returns (string memory) {
        return _collections[_collectionId].uri;
    }

    function getCollectionAmount(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].amount;
    }

    function getCollectionNoLimit(
        uint256 _collectionId
    ) public view returns (bool) {
        return _collections[_collectionId].noLimit;
    }

    function getCollectionPrice(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _collections[_collectionId].price;
    }

    function getCollectionIsDeleted(
        uint256 _collectionId
    ) public view returns (bool) {
        return _collections[_collectionId].isDeleted;
    }

    function getCollectionTimestamp(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].timestamp;
    }

    function getCollectionFulfillerId(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _fulfillerId[_collectionId];
    }

    function getCollectionPrintType(
        uint256 _collectionId
    ) public view returns (string memory) {
        return _printType[_collectionId];
    }

    function getCollectionIndex(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].index;
    }

    function getCollectionName(
        uint256 _collectionId
    ) public view returns (string memory) {
        return _collections[_collectionId].name;
    }

    function getCollectionTokenIds(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _collections[_collectionId].tokenIds;
    }

    function getCollectionDiscount(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _discount[_collectionId];
    }

    function getCollectionTokensMinted(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].mintedTokens;
    }

    function setCollectionPrintType(
        string memory _newPrintType,
        uint256 _collectionId
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );

        string memory oldPrintType = _printType[_collectionId];
        _printType[_collectionId] = _newPrintType;
        emit CollectionPrintTypeUpdated(
            _collectionId,
            oldPrintType,
            _newPrintType,
            msg.sender
        );
    }

    function setCollectionName(
        string memory _newName,
        uint256 _collectionId
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );

        string memory oldName = _collections[_collectionId].name;
        _collections[_collectionId].name = _newName;
        emit CollectionNameUpdated(
            _collectionId,
            oldName,
            _newName,
            msg.sender
        );
    }

    function setCollectionFulfillerId(
        uint256 _newFulfillerId,
        uint256 _collectionId
    ) external onlyCreator(_collectionId) {
        require(
            _coinOpFulfillment.getFulfillerAddress(_newFulfillerId) !=
                address(0),
            "CoinOpFulfillment: FulfillerId does not exist."
        );

        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        uint256 oldFufillerId = _fulfillerId[_collectionId];
        _fulfillerId[_collectionId] = _newFulfillerId;
        emit CollectionFulfillerIdUpdated(
            _collectionId,
            oldFufillerId,
            _newFulfillerId,
            msg.sender
        );
    }

    function setCollectionURI(
        string memory _newURI,
        uint256 _collectionId
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        string memory oldURI = _collections[_collectionId].uri;
        _collections[_collectionId].uri = _newURI;
        emit CollectionURIUpdated(_collectionId, oldURI, _newURI, msg.sender);
    }

    function setCollectionDiscount(
        uint256 _newDiscount,
        uint256 _collectionId
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        _discount[_collectionId] = _newDiscount;
        emit CollectionDiscountUpdated(_collectionId, _newDiscount, msg.sender);
    }

    function setCollectionPrice(
        uint256 _collectionId,
        uint256[] memory _newPrice
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        uint256[] memory oldPrice = _collections[_collectionId].price;
        _collections[_collectionId].price = _newPrice;
        emit CollectionPriceUpdated(
            _collectionId,
            oldPrice,
            _newPrice,
            msg.sender
        );
    }

    function getCollectionSupply() public view returns (uint256) {
        return _collectionSupply;
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function getCoinOpPaymentContract() public view returns (address) {
        return address(_coinOpPayment);
    }

    function getPreRollNFTContract() public view returns (address) {
        return address(_preRollNFT);
    }

    function getCoinOpMarketContract() public view returns (address) {
        return address(_coinOpMarket);
    }

    function getCoinOpFulfillmentContract() public view returns (address) {
        return address(_coinOpFulfillment);
    }
}
