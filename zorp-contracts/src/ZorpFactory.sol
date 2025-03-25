// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ZorpStudy } from "./ZorpStudy.sol";
import { IZorpStudy } from "./IZorpStudy.sol";
import {
    FactoryUpdated,
    FactoryUpdatedAlready,
    IZorpFactory_Functions,
    StudyCreated,
    WithdrawFailed
} from "./IZorpFactory.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Create and track addresses to `ZorpStudy` contracts and provide pagination
/// @author wkyleg
/// @author S0AndS0
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
contract ZorpFactory is Ownable, ReentrancyGuard, IZorpFactory_Functions {
    /// @dev see `IZorpFactory_Storage.VERSION()`
    uint256 public immutable VERSION = 1;

    /// @dev see `IZorpFactory_Storage.latest_study_index()`
    uint256 public latest_study_index;

    /// @dev see `IZorpFactory_Storage.studies()`
    mapping(uint256 => address) public studies;

    /// @dev see `IZorpFactory_Storage.ref_factory_previous()`
    address public ref_factory_previous = address(0);

    /// @dev see `IZorpFactory_Storage.ref_factory_next()`
    address public ref_factory_next;

    constructor (address payable initialOwner_) Ownable(initialOwner_) {}

    /// @inheritdoc IZorpFactory_Functions
    /// @dev see `./ZorpStudy.sol` -> `constructor`
    function createStudy(
        address payable initialOwner,
        string memory encryptionKey
    ) external payable returns (address) {
        address newStudy = address((new ZorpStudy){value: msg.value}(
            initialOwner,
            encryptionKey
        ));

        studies[++latest_study_index] = newStudy;
        emit StudyCreated(newStudy);
        return newStudy;
    }

    /// @inheritdoc IZorpFactory_Functions
    function setRefFactoryNext(address ref) external payable onlyOwner {
        if (ref_factory_next != address(0)) {
            revert FactoryUpdatedAlready(ref_factory_next, ref);
        }

        ref_factory_next = ref;
        emit FactoryUpdated(address(this), ref);
    }

    /// @inheritdoc IZorpFactory_Functions
    function withdraw(address payable to, uint256 amount) external payable nonReentrant onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert WithdrawFailed(to, amount, address(this).balance);
        }
    }

    /// @inheritdoc IZorpFactory_Functions
    function paginateSubmittedData(address study, uint256 start, uint256 limit) external view returns (string[] memory) {
        string[] memory results = new string[](limit);
        for (uint256 i; i < limit;) {
            results[i] = IZorpStudy(study).submitted_data(start++);
            unchecked { ++i; }
        }
        return results;
    }

    /// @inheritdoc IZorpFactory_Functions
    function paginateParticipantStatus(address study, uint256 start, uint256 limit) external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](limit);
        for (uint256 i; i < limit;) {
            results[i] = IZorpStudy(study).participant_status(
                IZorpStudy(study).index_participant(start++)
            );
            unchecked { ++i; }
        }
        return results;
    }

    /// @inheritdoc IZorpFactory_Functions
    function paginateStudies(uint256 start, uint256 limit) external view returns (address[] memory) {
        address[] memory results = new address[](limit);
        for (uint256 i; i < limit;) {
            results[i] = studies[start++];
            unchecked { ++i; }
        }
        return results;
    }

    receive() external payable {}
    fallback() external payable {}
}
