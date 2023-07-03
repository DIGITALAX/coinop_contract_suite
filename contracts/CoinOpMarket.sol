// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";
import "./CoinOpFulfillment.sol";
import "./PreRollCollection.sol";
import "./CustomCompositeNFT.sol";
import "./CoinOpChildFGO.sol";
import "./CoinOpParentFGO.sol";

contract CoinOpMarket {
    PreRollCollection private _preRollCollection;
    CoinOpAccessControl private _accessControl;
    CoinOpFulfillment private _coinOpFulfillment;
    CustomCompositeNFT private _customCompositeNFT;
    CoinOpChildFGO private _childFGO;
    CoinOpParentFGO private _parentFGO;
    uint256 private _orderSupply;
    string public symbol;
    string public name;

    struct Order {
        uint256 orderId;
        uint256 tokenId;
        uint256 timestamp;
        uint256 fulfillerId;
        uint256 price;
        uint256 tokenType;
        string status;
        string details;
        address buyer;
        address chosenAddress;
        bool isFulfilled;
    }

    mapping(uint256 => uint256) private _preRollTokensSold;
    mapping(uint256 => uint256[]) private _preRollTokenIdsSold;
    mapping(uint256 => Order) private _orders;

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyFulfiller(uint256 _fulfillerId) {
        require(
            _coinOpFulfillment.getFulfillerAddress(_fulfillerId) == msg.sender,
            "CoinOpMarket: Only the fulfiller can update this status."
        );
        _;
    }

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );
    event PreRollCollectionUpdated(
        address indexed oldPreRollCollection,
        address indexed newPreRollCollection,
        address updater
    );
    event CompositeNFTUpdated(
        address indexed oldCompositeNFT,
        address indexed newCompositeNFT,
        address updater
    );
    event ChildFGOUpdated(
        address indexed oldChildFGO,
        address indexed newChildFGO,
        address updater
    );
    event ParentFGOUpdated(
        address indexed oldParentFGO,
        address indexed newParentFGO,
        address updater
    );
    event CoinOpFulfillmentUpdated(
        address indexed oldCoinOpFulfillment,
        address indexed newCoinOpFulfillment,
        address updater
    );
    event TokensBought(
        uint256[] collectionIds,
        address chosenTokenAddress,
        uint256[] tokenTypes,
        uint256[] prices,
        uint256[] amounts,
        address buyer
    );
    event OrderIsFulfilled(uint256 indexed _orderId, address _fulfillerAddress);

    event OrderCreated(
        uint256 indexed orderId,
        uint256 totalPrice,
        address buyer,
        string fulfillmentInformation,
        uint256 fulfillerId
    );
    event UpdateOrderDetails(
        uint256 indexed _orderId,
        string newOrderDetails,
        address buyer
    );
    event UpdateOrderStatus(
        uint256 indexed _orderId,
        string newOrderStatus,
        address buyer
    );

    constructor(
        address _collectionContract,
        address _accessControlContract,
        address _fulfillmentContract,
        address _customCompositeContract,
        address _childFGOContract,
        address _parentFGOContract,
        string memory _symbol,
        string memory _name
    ) {
        _preRollCollection = PreRollCollection(_collectionContract);
        _accessControl = CoinOpAccessControl(_accessControlContract);
        _coinOpFulfillment = CoinOpFulfillment(_fulfillmentContract);
        _customCompositeNFT = CustomCompositeNFT(_customCompositeContract);
        _childFGO = CoinOpChildFGO(_childFGOContract);
        _parentFGO = CoinOpParentFGO(_parentFGOContract);
        symbol = _symbol;
        name = _name;
        _orderSupply = 0;
    }

    // collectionIds for preRoll and childId for custom
    function buyTokens(
        uint256[] memory _amounts,
        uint256[] memory _collectionIds,
        uint256[] memory _tokenTypes,
        string[] memory _customURIs,
        string memory _fulfillmentDetails,
        address _chosenTokenAddress
    ) external {
        require(
            _collectionIds.length == _amounts.length &&
                _tokenTypes.length == _amounts.length,
            "CoinOpMarket: Must provide an amount, token address and type for each collectionId."
        );

        for (uint256 i = 0; i < _tokenTypes.length; i++) {
            require(
                _tokenTypes[i] == 0 || _tokenTypes[i] == 1,
                "CoinOpMarket: Not a valid token type, must be custom or preroll"
            );
        }

        uint256[] memory _prices = new uint256[](_collectionIds.length);
        uint256[] memory _preRolls;
        uint256[] memory _preRollsAmounts;

        for (uint256 i = 0; i < _collectionIds.length; i++) {
            // preroll
            if (_tokenTypes[i] == 0) {
                (uint256 price, uint256 fulfillerId) = _preRollCollectionMint(
                    _collectionIds[i],
                    _chosenTokenAddress,
                    _amounts[i]
                );
                _canPurchase(_chosenTokenAddress, price);
                address creator = _preRollCollection.getCollectionCreator(
                    _collectionIds[i]
                );
                _transferTokens(
                    _chosenTokenAddress,
                    creator,
                    msg.sender,
                    price,
                    fulfillerId
                );
                _prices[i] = price;
                _preRollsAmounts[i] = _amounts[i];
                _preRolls[i] = _collectionIds[i];

                uint256[] memory _tokenIds = _preRollCollection
                    .getCollectionTokenIds(_preRolls[i]);

                _preRollTokensSold[_preRolls[i]] += 1;
                _preRollTokenIdsSold[_preRolls[i]].push(
                    _tokenIds[_tokenIds.length - 1]
                );

                _createOrder(
                    _chosenTokenAddress,
                    msg.sender,
                    price,
                    fulfillerId,
                    0,
                    _tokenIds[_tokenIds.length - 1],
                    _fulfillmentDetails
                );
            } else {
                (uint256 price, uint256 fulfillerId) = _customCompositeMint(
                    _collectionIds[i],
                    _chosenTokenAddress
                );
                _canPurchase(_chosenTokenAddress, price);
                address creator = _childFGO.getChildCreator(_collectionIds[i]);
                _transferTokens(
                    _chosenTokenAddress,
                    creator,
                    msg.sender,
                    price,
                    fulfillerId
                );

                _customCompositeNFT.mintBatch(
                    _chosenTokenAddress,
                    creator,
                    price,
                    _amounts[i],
                    fulfillerId,
                    _collectionIds[i],
                    _customURIs[i]
                );

                _createOrder(
                    _chosenTokenAddress,
                    msg.sender,
                    price,
                    fulfillerId,
                    1,
                    _collectionIds[i],
                    _fulfillmentDetails
                );

                _prices[i] = price;
            }
        }

        _preRollCollection.purchaseAndMintToken(
            _preRolls,
            _preRollsAmounts,
            msg.sender
        );

        emit TokensBought(
            _collectionIds,
            _chosenTokenAddress,
            _tokenTypes,
            _prices,
            _amounts,
            msg.sender
        );
    }

    function _createOrder(
        address _chosenAddress,
        address _buyer,
        uint256 _price,
        uint256 _fulfillerId,
        uint256 _tokenType,
        uint256 _tokenId,
        string memory _fulfillmentDetails
    ) internal {
        _orderSupply++;

        Order memory newOrder = Order({
            orderId: _orderSupply,
            tokenId: _tokenId,
            details: _fulfillmentDetails,
            buyer: _buyer,
            chosenAddress: _chosenAddress,
            tokenType: _tokenType,
            price: _price,
            timestamp: block.timestamp,
            status: "ordered",
            isFulfilled: false,
            fulfillerId: _fulfillerId
        });

        _orders[_orderSupply] = newOrder;

        emit OrderCreated(
            _orderSupply,
            _price,
            _buyer,
            _fulfillmentDetails,
            _fulfillerId
        );
    }

    function _transferTokens(
        address _chosenAddress,
        address _creator,
        address _buyer,
        uint256 _price,
        uint256 _fulfillerId
    ) internal {
        IERC20(_chosenAddress).transferFrom(
            _buyer,
            _creator,
            _price -
                ((_price *
                    (_coinOpFulfillment.getFulfillerPercent(_fulfillerId))) /
                    100)
        );
        IERC20(_chosenAddress).transferFrom(
            _buyer,
            _coinOpFulfillment.getFulfillerAddress(_fulfillerId),
            ((_price * (_coinOpFulfillment.getFulfillerPercent(_fulfillerId))) /
                100)
        );
    }

    function _preRollCollectionMint(
        uint256 _collectionId,
        address _chosenAddress,
        uint256 _amount
    ) internal view returns (uint256, uint256) {
        require(
            _preRollCollection.getCollectionTokensMinted(_collectionId) +
                _amount <
                _preRollCollection.getCollectionAmount(_collectionId),
            "CoinOpMarket: No more tokens can be bought from this collection."
        );

        address[] memory acceptedTokens = _preRollCollection
            .getCollectionAcceptedTokens(_collectionId);
        _isAcceptedToken(acceptedTokens, _chosenAddress);

        uint256 preRollPrice;

        for (uint256 j = 0; j < acceptedTokens.length; j++) {
            if (acceptedTokens[j] == _chosenAddress) {
                preRollPrice = _preRollCollection.getCollectionBasePrices(
                    _collectionId
                )[j];

                if (
                    _preRollCollection.getCollectionDiscount(_collectionId) != 0
                ) {
                    preRollPrice =
                        preRollPrice -
                        ((preRollPrice *
                            _preRollCollection.getCollectionDiscount(
                                _collectionId
                            )) / 100);
                }

                break;
            }
        }

        uint256 fulfillerId = _preRollCollection.getCollectionFulfillerId(
            _collectionId
        );

        return (preRollPrice, fulfillerId);
    }

    function _customCompositeMint(
        uint256 _childId,
        address _chosenAddress
    ) internal view returns (uint256, uint256) {
        address[] memory acceptedTokens = _childFGO.getChildAcceptedTokens(
            _childId
        );
        _isAcceptedToken(acceptedTokens, _chosenAddress);

        uint256 customPrice;

        for (uint256 j = 0; j < acceptedTokens.length; j++) {
            if (acceptedTokens[j] == _chosenAddress) {
                uint256 parentId = _childFGO.getChildTokenParentId(_childId);
                uint256 parentPrice = _parentFGO.getParentPrices(parentId)[j];
                customPrice =
                    _childFGO.getChildPrices(_childId)[j] +
                    parentPrice;
                break;
            }
        }

        uint256 fulfillerId = _childFGO.getChildFulfillerId(_childId);

        return (customPrice, fulfillerId);
    }

    function _canPurchase(
        address _chosenAddress,
        uint256 _price
    ) internal view {
        uint256 allowance = IERC20(_chosenAddress).allowance(
            msg.sender,
            address(this)
        );

        require(
            allowance >= _price,
            "CoinOpMarket: Insufficient Approval Allowance."
        );
    }

    function _isAcceptedToken(
        address[] memory _acceptedTokens,
        address _chosenAddress
    ) internal pure {
        bool isAccepted = false;
        for (uint256 j = 0; j < _acceptedTokens.length; j++) {
            if (_acceptedTokens[j] == _chosenAddress) {
                isAccepted = true;
                break;
            }
        }
        require(
            isAccepted,
            "CoinOpMarket: Chosen token address is not an accepted token for the collection."
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

    function updatePreRollCollection(
        address _newPreRollCollectionAddress
    ) external onlyAdmin {
        address oldAddress = address(_preRollCollection);
        _preRollCollection = PreRollCollection(_newPreRollCollectionAddress);
        emit PreRollCollectionUpdated(
            oldAddress,
            _newPreRollCollectionAddress,
            msg.sender
        );
    }

    function updateCoinOpFulfillment(
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

    function updateCompositeNFT(
        address _newCompositeNFTAddress
    ) external onlyAdmin {
        address oldAddress = address(_customCompositeNFT);
        _customCompositeNFT = CustomCompositeNFT(_newCompositeNFTAddress);
        emit CompositeNFTUpdated(
            oldAddress,
            _newCompositeNFTAddress,
            msg.sender
        );
    }

    function updateChildFGO(address _newChildFGOAddress) external onlyAdmin {
        address oldAddress = address(_childFGO);
        _childFGO = CoinOpChildFGO(_newChildFGOAddress);
        emit ChildFGOUpdated(oldAddress, _newChildFGOAddress, msg.sender);
    }

    function updateParentFGO(address _newParentFGOAddress) external onlyAdmin {
        address oldAddress = address(_parentFGO);
        _parentFGO = CoinOpParentFGO(_newParentFGOAddress);
        emit ParentFGOUpdated(oldAddress, _newParentFGOAddress, msg.sender);
    }

    function getCollectionPreRollSoldCount(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _preRollTokensSold[_collectionId];
    }

    function getTokensSoldCollectionPreRoll(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _preRollTokenIdsSold[_collectionId];
    }

    function getOrderTokenId(uint256 _orderId) public view returns (uint256) {
        return _orders[_orderId].tokenId;
    }

    function getOrderDetails(
        uint256 _orderId
    ) public view returns (string memory) {
        return _orders[_orderId].details;
    }

    function getOrderBuyer(uint256 _orderId) public view returns (address) {
        return _orders[_orderId].buyer;
    }

    function getOrderChosenAddress(
        uint256 _orderId
    ) public view returns (address) {
        return _orders[_orderId].chosenAddress;
    }

    function getOrderTimestamp(uint256 _orderId) public view returns (uint256) {
        return _orders[_orderId].timestamp;
    }

    function getOrderStatus(
        uint256 _orderId
    ) public view returns (string memory) {
        return _orders[_orderId].status;
    }

    function getOrderIsFulfilled(uint256 _orderId) public view returns (bool) {
        return _orders[_orderId].isFulfilled;
    }

    function getOrderFulfillerId(
        uint256 _orderId
    ) public view returns (uint256) {
        return _orders[_orderId].fulfillerId;
    }

    function getOrderTokenType(uint256 _orderId) public view returns (uint256) {
        return _orders[_orderId].tokenType;
    }

    function getOrderSupply() public view returns (uint256) {
        return _orderSupply;
    }

    function setOrderisFulfilled(
        uint256 _orderId
    ) external onlyFulfiller(_orders[_orderId].fulfillerId) {
        _orders[_orderId].isFulfilled = true;
        emit OrderIsFulfilled(_orderId, msg.sender);
    }

    function setOrderStatus(
        uint256 _orderId,
        string memory _status
    ) external onlyFulfiller(_orders[_orderId].fulfillerId) {
        _orders[_orderId].status = _status;
        emit UpdateOrderStatus(_orderId, _status, msg.sender);
    }

    function setOrderDetails(
        uint256 _orderId,
        string memory _newDetails
    ) external {
        require(
            _orders[_orderId].buyer == msg.sender,
            "CoinOpMarket: Only the buyer can update their order details."
        );
        _orders[_orderId].details = _newDetails;
        emit UpdateOrderDetails(_orderId, _newDetails, msg.sender);
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function getPreRollCollectionContract() public view returns (address) {
        return address(_preRollCollection);
    }

    function getCoinOpFulfillmentContract() public view returns (address) {
        return address(_coinOpFulfillment);
    }

    function getCompositeNFTContract() public view returns (address) {
        return address(_customCompositeNFT);
    }

    function getChildFGOContract() public view returns (address) {
        return address(_childFGO);
    }

    function getParentFGOContract() public view returns (address) {
        return address(_parentFGO);
    }
}
