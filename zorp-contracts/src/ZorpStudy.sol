// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract ZorpStudy {
    // In the real version, you'd store:
    //   - merkleRoot
    //   - token type (ETH vs. native token)
    //   - admin or owner
    //   - submission data, etc.

    // Minimal placeholder for submissions. In the future, you might store:
    // struct Submission {
    //     string ipfsCID;
    //     bool valid;
    // }
    // Submission[] public submissions;

    constructor() {
        // Future: accept constructor args (e.g. merkleRoot, externalNullifier).
    }

    function submitData() external {
        // Stub for users to submit data + proofs.
    }

    function flagInvalidSubmission(uint256 index) external {
        // Admin can flag invalid data.
    }

    function endStudy() external {
        // Admin ends the study, no more submissions.
    }

    function claimReward() external {
        // Participants can claim their reward here.
    }
}
