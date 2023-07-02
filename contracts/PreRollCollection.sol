// SPDX-License-Identifier: UNLICENSE

import "./CoinOpMarket.sol";
import "./CoinOpAccessControl.sol";
import "./CoinOpFulfillment.sol";
import "./CoinOpPayment.sol";
import "./PreRollNFT.sol";

pragma solidity ^0.8.9;

library MintParamsLibrary {
    struct MintParams {
        address[] acceptedTokens;
        uint256[] basePrices;
        uint256 fulfillerId;
        uint256 discount;
        string[] sizes;
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
        uint256[] basePrices;
        uint256[] tokenIds;
        uint256 collectionId;
        uint256 amount;
        uint256 timestamp;
        uint256 mintedTokens;
        address[] acceptedTokens;
        address creator;
        string uri;
        bool isDeleted;
    }

    mapping(uint256 => Collection) private _collections;
    mapping(uint256 => uint256) private _fulfillerId;
    mapping(uint256 => string) private _printType;
    mapping(uint256 => string[]) private _sizes;
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

    event CollectionBasePricesUpdated(
        uint256 indexed collectionId,
        uint256[] oldPrices,
        uint256[] newPrices,
        address updater
    );

    event CollectionAcceptedTokensUpdated(
        uint256 indexed collectionId,
        address[] oldAcceptedTokens,
        address[] newAcceptedTokens,
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

    event CollectionSizesUpdated(
        uint256 indexed collectionId,
        string[] oldSizes,
        string[] newSizes,
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
            params.basePrices.length == params.acceptedTokens.length,
            "PreRollCollection: Invalid input"
        );
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
        for (uint256 i = 0; i < params.acceptedTokens.length; i++) {
            require(
                _coinOpPayment.checkIfAddressVerified(params.acceptedTokens[i]),
                "PreRollCollection: Payment Token is Not Verified"
            );
        }

        _collectionSupply++;

        if (_noLimit) {
            _amount = type(uint256).max;
        }

        _createNewCollection(params, _amount, _creator);

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
            _collections[_collectionId].amount == type(uint256).max,
            "PreRollCollection: Collection cannot be added to."
        );

        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted"
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
        _sizes[_collectionSupply] = params.sizes;
        _fulfillerId[_collectionSupply] = params.fulfillerId;
        _discount[_collectionSupply] = params.discount;
    }

    function _createNewCollection(
        MintParamsLibrary.MintParams memory params,
        uint256 _amount,
        address _creatorAddress
    ) private {
        Collection memory newCollection = Collection({
            collectionId: _collectionSupply,
            acceptedTokens: params.acceptedTokens,
            basePrices: params.basePrices,
            tokenIds: new uint256[](0),
            amount: _amount,
            mintedTokens: 0,
            creator: _creatorAddress,
            uri: params.uri,
            isDeleted: false,
            timestamp: block.timestamp
        });

        _collections[_collectionSupply] = newCollection;
    }

    function _mintNFT(
        Collection memory _collection,
        uint256 _amount,
        address _creatorAddress,
        address _purchaserAddress
    ) private {
        MintParamsLibrary.MintParams memory paramsNFT = MintParamsLibrary
            .MintParams({
                acceptedTokens: _collection.acceptedTokens,
                basePrices: _collection.basePrices,
                uri: _collection.uri,
                printType: _printType[_collection.collectionId],
                fulfillerId: _fulfillerId[_collection.collectionId],
                discount: _discount[_collection.collectionId],
                sizes: _sizes[_collection.collectionId]
            });

        _preRollNFT.mintBatch(
            paramsNFT,
            _amount,
            _collectionSupply,
            _creatorAddress,
            _purchaserAddress
        );
    }

    function purchaseAndMintToken(
        uint256[] memory _collectionIds,
        uint256[] memory _amounts,
        address _purchaserAddress
    ) external onlyMarket {
        require(
            _collectionIds.length == _amounts.length,
            "PreRollCollection: Input arrays must be of equal length"
        );

        for (uint256 c = 0; c < _collectionIds.length; c++) {
            Collection storage collection = _collections[_collectionIds[c]];

            require(
                !collection.isDeleted,
                "PreRollCollection: This collection has been deleted."
            );

            require(
                collection.amount == type(uint256).max ||
                    collection.mintedTokens + _amounts[c] <= collection.amount,
                "PreRollCollection: Cannot mint more than collection amount"
            );

            uint256 initialSupply = _preRollNFT.getTotalSupplyCount();

            for (uint256 i = 0; i < _amounts[c]; i++) {
                _mintNFT(
                    _collections[_collectionIds[c]],
                    _amounts[c],
                    collection.creator,
                    _purchaserAddress
                );
            }

            uint256 finalSupply = _preRollNFT.getTotalSupplyCount();
            uint256[] memory emissionArray = new uint256[](_amounts[c]);

            for (uint256 i = initialSupply + 1; i <= finalSupply; i++) {
                collection.tokenIds.push(i);
                emissionArray[i - (initialSupply + 1)] = i;
                collection.mintedTokens++;
            }

            emit TokensMinted(
                collection.collectionId,
                collection.uri,
                _amounts[c],
                emissionArray,
                collection.creator
            );
        }
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

    function getCollectionAcceptedTokens(
        uint256 _collectionId
    ) public view returns (address[] memory) {
        return _collections[_collectionId].acceptedTokens;
    }

    function getCollectionBasePrices(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _collections[_collectionId].basePrices;
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

    function getCollectionSizes(
        uint256 _collectionId
    ) public view returns (string[] memory) {
        return _sizes[_collectionId];
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

    function setCollectionSizes(
        string[] memory _newSizes,
        uint256 _collectionId
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );

        string[] memory oldSizes = _sizes[_collectionId];
        _sizes[_collectionId] = _newSizes;
        emit CollectionSizesUpdated(
            _collectionId,
            oldSizes,
            _newSizes,
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

    function setCollectionBasePrices(
        uint256 _collectionId,
        uint256[] memory _newPrices
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        uint256[] memory oldPrices = _collections[_collectionId].basePrices;
        _collections[_collectionId].basePrices = _newPrices;
        emit CollectionBasePricesUpdated(
            _collectionId,
            oldPrices,
            _newPrices,
            msg.sender
        );
    }

    function setCollectionAcceptedTokens(
        uint256 _collectionId,
        address[] memory _newAcceptedTokens
    ) external onlyCreator(_collectionId) {
        require(
            !_collections[_collectionId].isDeleted,
            "PreRollCollection: This collection has been deleted."
        );
        address[] memory oldTokens = _collections[_collectionId].acceptedTokens;
        _collections[_collectionId].acceptedTokens = _newAcceptedTokens;
        emit CollectionAcceptedTokensUpdated(
            _collectionId,
            oldTokens,
            _newAcceptedTokens,
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
