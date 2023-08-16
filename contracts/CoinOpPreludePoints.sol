// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "./CoinOpAccessControl.sol";

contract CoinOpPreludePoints {
    CoinOpAccessControl private _accessControl;
    address private _pkpAddress;
    string public symbol;
    string public name;
    uint256 private _totalQuests;
    uint256 private _totalQuestParticipants;

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
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
    modifier participantExists(address _participantAddress) {
        require(
            _questParticipants[_participantAddress].participantId > 0,
            "CoinOpQuestPrelude: Participant must exist."
        );
        _;
    }

    struct Participant {
        address participantAddress;
        uint256[] questsCompletedIds;
        uint256 participantId;
        uint256 pointScore;
        uint256 questsCompleted;
        uint256 questStartTime;
        bool withPKP;
    }

    mapping(address => Participant) private _questParticipants;
    mapping(uint256 => uint256) private _pointsPerQuest;

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );
    event NewQuestSignUp(
        uint256 indexed participantId,
        address participantAddress
    );
    event PKPAddressUpdated(
        address indexed oldPKPAddress,
        address indexed newPKPAddress,
        address updater
    );
    event ParticipantQuestReference(
        address participantAddress,
        uint256 questsCompleted,
        uint256 totalPoints
    );
    event TotalQuestsSet(uint256 questNumber);
    event PointsPerQuestSet(uint256[] questNumbers, uint256[] pointScores);

    constructor(
        address _accessControlAddress,
        string memory _name,
        string memory _symbol,
        address _pkpAddressAccount
    ) {
        _accessControl = CoinOpAccessControl(_accessControlAddress);
        symbol = _symbol;
        name = _name;
        _pkpAddress = _pkpAddressAccount;
        _totalQuests = 0;
        _totalQuestParticipants = 0;
    }

    function signUpForQuest(
        address _participantAddress,
        uint256[] memory _questsCompletedIds,
        uint256 _initialPointScore,
        uint256 _initialQuestsCompleted,
        bool _withPKP
    ) external onlyPKPOrAdmin {
        require(
            _questsCompletedIds.length == _initialQuestsCompleted,
            "CoinOpPreludePoints: Quest Ids length and initial Quests completed must match."
        );
        _totalQuestParticipants++;
        Participant memory newParticipant = Participant({
            participantAddress: _participantAddress,
            participantId: _totalQuestParticipants,
            pointScore: _initialPointScore,
            questsCompleted: _initialQuestsCompleted,
            questsCompletedIds: _questsCompletedIds,
            questStartTime: block.timestamp,
            withPKP: _withPKP
        });
        _questParticipants[_participantAddress] = newParticipant;

        emit NewQuestSignUp(_totalQuestParticipants, _participantAddress);
    }

    function updateParticipantQuestReference(
        address _participantAddress,
        uint256[] memory _questsCompletedIds,
        uint256 _questsCompletedCount
    ) external onlyPKPOrAdmin participantExists(_participantAddress) {
        uint256 _totalPoints = 0;
        for (uint256 i = 0; i < _questsCompletedIds.length; i++) {
            _totalPoints += _pointsPerQuest[_questsCompletedIds[i]];
        }

        _questParticipants[_participantAddress]
            .questsCompleted += _questsCompletedCount;
        _questParticipants[_participantAddress].pointScore += _totalPoints;
        for (uint256 i = 0; i < _questsCompletedIds.length; i++) {
            _questParticipants[_participantAddress].questsCompletedIds.push(
                _questsCompletedIds[i]
            );
        }

        emit ParticipantQuestReference(
            _participantAddress,
            _questsCompletedCount,
            _totalPoints
        );
    }

    function lowerParticipantQuestReference(
        address _participantAddress,
        uint256[] memory _questsCompletedIds,
        uint256 _questsCompleted
    ) external onlyPKPOrAdmin participantExists(_participantAddress) {
        uint256 _totalPoints = 0;
        for (uint256 i = 0; i < _questsCompletedIds.length; i++) {
            _totalPoints += _pointsPerQuest[_questsCompletedIds[i]];
        }

        _questParticipants[_participantAddress]
            .questsCompleted = _questsCompleted;
        _questParticipants[_participantAddress].pointScore = _totalPoints;
        _questParticipants[_participantAddress]
            .questsCompletedIds = _questsCompletedIds;

        emit ParticipantQuestReference(
            _participantAddress,
            _questsCompleted,
            _totalPoints
        );
    }

    function updatePKPAddress(address _newPKPAddress) external onlyAdmin {
        address oldAddress = _pkpAddress;
        _pkpAddress = _newPKPAddress;
        emit PKPAddressUpdated(oldAddress, _newPKPAddress, msg.sender);
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

    function setTotalQuests(uint256 _questNumber) external onlyAdmin {
        _totalQuests = _questNumber;
        emit TotalQuestsSet(_questNumber);
    }

    function setPointsPerQuest(
        uint256[] memory _questNumbers,
        uint256[] memory _pointScores
    ) external onlyAdmin {
        for (uint256 i = 0; i < _questNumbers.length; i++) {
            _pointsPerQuest[_questNumbers[i]] = _pointScores[i];
        }

        emit PointsPerQuestSet(_questNumbers, _pointScores);
    }

    function getQuestStartTime(
        address _participantAddress
    ) public view returns (uint256) {
        return _questParticipants[_participantAddress].questStartTime;
    }

    function getPointsPerQuest(
        uint256 _questIndex
    ) public view returns (uint256) {
        return _pointsPerQuest[_questIndex];
    }

    function getQuestsCompleted(
        address _participantAddress
    ) public view returns (uint256) {
        return _questParticipants[_participantAddress].questsCompleted;
    }

    function getQuestWithPKP(
        address _participantAddress
    ) public view returns (bool) {
        return _questParticipants[_participantAddress].withPKP;
    }

    function getQuestsPointScore(
        address _participantAddress
    ) public view returns (uint256) {
        return _questParticipants[_participantAddress].pointScore;
    }

    function getQuestsParticipantId(
        address _participantAddress
    ) public view returns (uint256) {
        return _questParticipants[_participantAddress].participantId;
    }

    function participantQuestExists(
        address _participantAddress
    ) public view returns (bool) {
        return _questParticipants[_participantAddress].participantId > 0;
    }

    function getParticipantQuestsCompletedIds(
        address _participantAddress
    ) public view returns (uint256[] memory) {
        return _questParticipants[_participantAddress].questsCompletedIds;
    }

    function getTotalQuests() public view returns (uint256) {
        return _totalQuests;
    }

    function getTotalQuestParticipants() public view returns (uint256) {
        return _totalQuestParticipants;
    }

    function getAccessControlContract() public view returns (address) {
        return address(_accessControl);
    }

    function getPKPAddress() public view returns (address) {
        return _pkpAddress;
    }
}
