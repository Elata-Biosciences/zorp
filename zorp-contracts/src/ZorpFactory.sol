// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ZorpStudy } from "./ZorpStudy.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZorpFactory is Ownable, ReentrancyGuard {
    uint256 public constant VERSION = 1;

    // Optional: you could inherit Ownable if you want an admin for the factory.
    // e.g., `contract ZorpFactory is Ownable { ... }`

    // Array (or mapping) to track all deployed studies
    address[] public allStudies;

    event StudyCreated(address indexed studyAddress);

    constructor (address payable initialOwner_) Ownable(initialOwner_) {}

    // createStudy is just a stub. In the future, it will take parameters:
    // e.g. merkleRoot, externalNullifierSub, externalNullifierClaim, tokenAddress, etc.

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

        allStudies.push(newStudy);
        emit StudyCreated(newStudy);
        return newStudy;
    }

    // A getter to see how many studies have been created
    function getStudyCount() external view returns (uint256) {
        return allStudies.length;
    }
}
