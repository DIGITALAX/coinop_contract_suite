// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";
import "./CoinOpPKPs.sol";

contract CoinOpSubscription {
    CoinOpAccessControl private _accessControl;
    CoinOpPKPs private _coinOpPKPs;
    address private _pkpAddress;
    string public symbol;
    string public name;
    uint256 private _subscriberCountTotal;
    uint256 private _currentSubscribers;

    struct Subscriber {
        uint256 subscriptionId;
        uint256 subscribedTimestamp;
        uint256 unSubscribedTimestamp;
        uint256 resubscribedTimestamp;
        bool isSubscribed;
        string pkpTokenId;
    }

    mapping(string => Subscriber) private _subscribers;

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier userExists(string memory _tokenId) {
        require(
            _coinOpPKPs.userExists(_tokenId),
            "CoinOpPKPs: User does not yet have an account."
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
    event CoinOpPKPsUpdated(
        address indexed oldCoinOpPKPs,
        address indexed newCoinOpPKPs,
        address updater
    );
    event PKPAddressUpdated(
        address indexed oldPKPAddress,
        address indexed newPKPAddress,
        address updater
    );
    event SubscriberAdded(
        uint256 indexed subscriberId,
        string tokenId,
        address updater
    );
    event SubscriberRemoved(
        uint256 indexed subscriberId,
        string tokenId,
        address updater
    );
    event SubscriberReactivated(
        uint256 indexed subscriberId,
        string tokenId,
        address updater
    );

    constructor(
        address _accessControlAddress,
        address _coinOpPKPsAddress,
        address _pkpAddressAccount,
        string memory _name,
        string memory _symbol
    ) {
        _accessControl = CoinOpAccessControl(_accessControlAddress);
        _coinOpPKPs = CoinOpPKPs(_coinOpPKPsAddress);
        symbol = _symbol;
        name = _name;
        _pkpAddress = _pkpAddressAccount;
        _subscriberCountTotal = 0;
        _currentSubscribers = 0;
    }

    function subscribeWithPKP(
        string memory _tokenId
    ) external userExists(_tokenId) onlyPKPOrAdmin {
        _subscriberCountTotal++;
        _currentSubscribers++;
        Subscriber memory newSubscriber = Subscriber({
            subscriptionId: _subscriberCountTotal,
            subscribedTimestamp: block.timestamp,
            unSubscribedTimestamp: 0,
            resubscribedTimestamp: 0,
            pkpTokenId: _tokenId,
            isSubscribed: true
        });
        _subscribers[_tokenId] = newSubscriber;
        emit SubscriberAdded(_subscriberCountTotal, _tokenId, msg.sender);
    }

    function unsubscribeWithPKP(
        string memory _tokenId
    ) external userExists(_tokenId) onlyPKPOrAdmin {
        require(
            _subscribers[_tokenId].isSubscribed,
            "CoinOpSubscription: User is not yet subscribed."
        );
        require(
            _currentSubscribers > 0,
            "CoinOpSubscription: Underflow prevented."
        );
        _currentSubscribers--;
        _subscribers[_tokenId].isSubscribed = false;
        _subscribers[_tokenId].unSubscribedTimestamp = block.timestamp;
        emit SubscriberRemoved(
            _subscribers[_tokenId].subscriptionId,
            _tokenId,
            msg.sender
        );
    }

    function reactivateWithPKP(
        string memory _tokenId
    ) external userExists(_tokenId) onlyPKPOrAdmin {
        require(
            !_subscribers[_tokenId].isSubscribed,
            "CoinOpSubscription: User is not yet unsubscribed."
        );
        require(
            _subscribers[_tokenId].subscriptionId > 0,
            "CoinOpSubscription: User does not exist."
        );
        _currentSubscribers++;
        _subscribers[_tokenId].isSubscribed = true;
        _subscribers[_tokenId].resubscribedTimestamp = block.timestamp;
        emit SubscriberReactivated(
            _subscribers[_tokenId].subscriptionId,
            _tokenId,
            msg.sender
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

    function updateCoinOpPKPs(
        address _newCoinOpPKPsAddress
    ) external onlyAdmin {
        address oldAddress = address(_coinOpPKPs);
        _coinOpPKPs = CoinOpPKPs(_newCoinOpPKPsAddress);
        emit CoinOpPKPsUpdated(oldAddress, _newCoinOpPKPsAddress, msg.sender);
    }

    function updatePKPAddress(address _newPKPAddress) external onlyAdmin {
        address oldAddress = _pkpAddress;
        _pkpAddress = _newPKPAddress;
        emit PKPAddressUpdated(oldAddress, _newPKPAddress, msg.sender);
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function getCoinOpPKPsContract() public view returns (address) {
        return address(_coinOpPKPs);
    }

    function getPKPAddress() public view returns (address) {
        return _pkpAddress;
    }

    function getIsUserSubscribed(
        string memory _tokenId
    ) public view returns (bool) {
        return _subscribers[_tokenId].isSubscribed;
    }

    function getSubscribedUserSubscriptionId(
        string memory _tokenId
    ) public view returns (uint256) {
        return _subscribers[_tokenId].subscriptionId;
    }

    function getSubscribedUserDate(
        string memory _tokenId
    ) public view returns (uint256) {
        return _subscribers[_tokenId].subscribedTimestamp;
    }

    function getUnsubscribedUserDate(
        string memory _tokenId
    ) public view returns (uint256) {
        return _subscribers[_tokenId].unSubscribedTimestamp;
    }

    function getResubscribedUserDate(
        string memory _tokenId
    ) public view returns (uint256) {
        return _subscribers[_tokenId].resubscribedTimestamp;
    }

    function getSubscriberCountTotal() public view returns (uint256) {
        return _subscriberCountTotal;
    }

    function getSubscriberCountCurrent() public view returns (uint256) {
        return _currentSubscribers;
    }
}
