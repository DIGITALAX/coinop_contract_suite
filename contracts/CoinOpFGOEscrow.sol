// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./CoinOpChildFGO.sol";
import "./CoinOpParentFGO.sol";
import "./CoinOpAccessControl.sol";

contract CoinOpFGOEscrow is ERC721Holder {
    CoinOpAccessControl private _accessControl;
    CoinOpParentFGO private _parentFGO;
    CoinOpChildFGO private _childFGO;
    string public symbol;
    string public name;

    mapping(uint256 => bool) private _childDeposited;
    mapping(uint256 => bool) private _parentDeposited;

    event AccessControlUpdated(
        address indexed oldAccessControl,
        address indexed newAccessControl,
        address updater
    );
    event CoinOPChildFGOUpdated(
        address indexed oldCoinOPChildFGO,
        address indexed newCoinOPChildFGO,
        address updater
    );
    event CoinOPParentFGOUpdated(
        address indexed oldCoinOPParentFGO,
        address indexed newCoinOPParentFGO,
        address updater
    );

    constructor(
        address _parentFGOContract,
        address _childFGOContract,
        address _accessControlContract,
        string memory _symbol,
        string memory _name
    ) {
        _accessControl = CoinOpAccessControl(_accessControlContract);
        _parentFGO = CoinOpParentFGO(_parentFGOContract);
        _childFGO = CoinOpChildFGO(_childFGOContract);
        symbol = _symbol;
        name = _name;
    }

    modifier onlyAdmin() {
        require(
            _accessControl.isAdmin(msg.sender),
            "CoinOpAccessControl: Only admin can perform this action"
        );
        _;
    }

    modifier onlyDepositer() {
        require(
            msg.sender == address(_parentFGO) ||
                msg.sender == address(_childFGO),
            "CoinOpFGOEscrow: Only the Chromadin Collection or NFT contract can call this function"
        );
        _;
    }

    function depositParent(
        uint256 _parentTokenId,
        bool _bool
    ) external onlyDepositer {
        _parentDeposited[_parentTokenId] = _bool;
    }

    function depositChildren(
        uint256[] memory _childTokenIds,
        bool _bool
    ) external onlyDepositer {
        for (uint256 i; i < _childTokenIds.length; i++) {
            _childDeposited[_childTokenIds[i]] = _bool;
        }
    }

    function releaseParent(
        uint256 _parentTokenId,
        address _to
    ) external onlyAdmin {
        require(
            _parentDeposited[_parentTokenId],
            "CoinOpFGOEscrow: Token must be in escrow"
        );
        _parentDeposited[_parentTokenId] = false;
        uint256[] memory _childTokens = _parentFGO.getParentChildTokens(
            _parentTokenId
        );

        for (uint256 i; i < _childTokens.length; i++) {
            _childFGO.setParentId(_childTokens[i], 0);
        }
        _parentFGO.burn(_parentTokenId);
    }

    function releaseChildren(
        uint256[] memory _childTokenIds,
        address _to
    ) external onlyAdmin {
        for (uint256 i; i < _childTokenIds.length; i++) {
            require(
                _childDeposited[_childTokenIds[i]],
                "CoinOpFGOEscrow: Token must be in escrow"
            );
        }

        for (uint256 i; i < _childTokenIds.length; i++) {
            _childDeposited[_childTokenIds[i]] = false;

            _childFGO.burn(_childTokenIds[i], 1);

            uint256 parentId = _childFGO.getChildTokenParentId(
                _childTokenIds[i]
            );

            uint256[] memory childTokens = _parentFGO.getParentChildTokens(
                parentId
            );

            uint256[] memory newChildTokens = new uint256[](
                childTokens.length - 1
            );
            uint256 index = 0;

            for (uint256 j = 0; j < childTokens.length; j++) {
                if (childTokens[j] != _childTokenIds[i]) {
                    newChildTokens[index] = childTokens[j];
                    index++;
                }
            }

            _parentFGO.setChildTokenIds(parentId, newChildTokens);
        }
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

    function getAccessControlAddress() public view returns (address) {
        return address(_accessControl);
    }

    function getChildFGOAddress() public view returns (address) {
        return address(_childFGO);
    }

    function getParentFGOAddress() public view returns (address) {
        return address(_parentFGO);
    }
}
