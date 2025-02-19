// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ZorpStudy.sol";
// or "openzeppelin-contracts/contracts/access/Ownable.sol" if needed

contract ZorpFactory {
    // Optional: you could inherit Ownable if you want an admin for the factory.
    // e.g., `contract ZorpFactory is Ownable { ... }`

    // Array (or mapping) to track all deployed studies
    address[] public allStudies;

    event StudyCreated(address indexed studyAddress);

    // createStudy is just a stub. In the future, it will take parameters:
    // e.g. merkleRoot, externalNullifierSub, externalNullifierClaim, tokenAddress, etc.
    function createStudy() external returns (address) {
        // Deploy a new ZorpStudy contract (stubbed).
        ZorpStudy newStudy = new ZorpStudy();
        allStudies.push(address(newStudy));

        emit StudyCreated(address(newStudy));
        return address(newStudy);
    }

    // A getter to see how many studies have been created
    function getStudyCount() external view returns (uint256) {
        return allStudies.length;
    }
}
