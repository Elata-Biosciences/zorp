// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ZorpStudy } from "./ZorpStudy.sol";
import { IZorpStudy } from "./IZorpStudy.sol";
import { IZorpFactory_Functions } from "./IZorpFactory.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZorpFactory is Ownable, ReentrancyGuard, IZorpFactory_Functions {
    uint256 public constant VERSION = 1;
    uint256 public latest_study_index;
    mapping(uint256 => address) public studies;

    event StudyCreated(address indexed studyAddress);

    constructor (address payable initialOwner_) Ownable(initialOwner_) {}

    /// Wrapper to deploy a new ZorpStudy contract
    /// @param initialOwner owner or admin of study
    /// @param encryptionKey pointer to public GPG/PGP key
    /// @dev see `src/ZorpStudy.sol` -> `constructor`
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

    function withdraw(address payable to, uint256 amount) external payable onlyOwner nonReentrant {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ZorpFactory: Failed withdraw");
    }

    function paginateSubmittedData(address study, uint256 start, uint256 limit) external view returns (string[] memory) {
        string[] memory results = new string[](limit);
        for (uint256 i; i < limit;) {
            results[i] = IZorpStudy(study).submitted_data(start++);
            unchecked { ++i; }
        }
        return results;
    }

    function paginateStudies(uint256 start, uint256 limit) external view returns (address[] memory) {
        address[] memory results = new address[](limit);
        for (uint256 i; i < limit;) {
            results[i] = studies[start++];
            unchecked { ++i; }
        }
        return results;
    }
}
