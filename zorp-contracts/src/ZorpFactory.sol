// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ZorpStudy } from "./ZorpStudy.sol";
// or "openzeppelin-contracts/contracts/access/Ownable.sol" if needed
// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZorpFactory {
    // Optional: you could inherit Ownable if you want an admin for the factory.
    // e.g., `contract ZorpFactory is Ownable { ... }`

    // Array (or mapping) to track all deployed studies
    address[] public allStudies;

    event StudyCreated(address indexed studyAddress);

    // createStudy is just a stub. In the future, it will take parameters:
    // e.g. merkleRoot, externalNullifierSub, externalNullifierClaim, tokenAddress, etc.

    /// Wrapper to deploy a new ZorpStudy contract
    /// @param initialOwner owner or admin of study
    /// @param encryptionKey pointer to public GPG/PGP key
    /// @dev see `src/ZorpStudy.sol` -> `constructor`
    function createStudy(
        address initialOwner,
        string memory encryptionKey
    ) external returns (address) {
        address newStudy = address(new ZorpStudy(
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
