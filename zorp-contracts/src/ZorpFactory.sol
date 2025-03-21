// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ZorpStudy } from "./ZorpStudy.sol";
import { IZorpStudy } from "./IZorpStudy.sol";
import { IZorpFactory_Functions } from "./IZorpFactory.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Create and track addresses to `ZorpStudy` contracts and provide pagination
/// @author wkyleg
/// @author S0AndS0
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
contract ZorpFactory is Ownable, ReentrancyGuard, IZorpFactory_Functions {
    /// @dev see `IZorpFactory_Storage.VERSION()`
    uint256 public constant VERSION = 1;

    /// @dev see `IZorpFactory_Storage.latest_study_index()`
    uint256 public latest_study_index;

    /// @dev see `IZorpFactory_Storage.studies()`
    mapping(uint256 => address) public studies;

    /// @dev see `IZorpFactory_Storage.ref_factory_previous()`
    address public constant ref_factory_previous = address(0);

    /// @dev see `IZorpFactory_Storage.ref_factory_next()`
    address public ref_factory_next;

    event StudyCreated(address indexed studyAddress);

    constructor (address payable initialOwner_) Ownable(initialOwner_) {}

    /// @inheritdoc IZorpFactory_Functions
    /// @dev see `./ZorpStudy.sol` -> `constructor`
    /// @custom:todo double-check if this really needs to be `nonReentrant`
    function createStudy(
        address payable initialOwner,
        string memory encryptionKey
    ) external payable nonReentrant returns (address) {
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
        require(ref_factory_next == address(0), "ZorpFactory: next factory reference already set");
        ref_factory_next = ref;
    }

    /// @inheritdoc IZorpFactory_Functions
    function withdraw(address payable to, uint256 amount) external payable nonReentrant onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ZorpFactory: Failed withdraw");
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
    function paginateStudies(uint256 start, uint256 limit) external view returns (address[] memory) {
        address[] memory results = new address[](limit);
        for (uint256 i; i < limit;) {
            results[i] = studies[start++];
            unchecked { ++i; }
        }
        return results;
    }
}
