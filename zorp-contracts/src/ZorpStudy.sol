// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IZorpStudy_Functions } from "./IZorpStudy.sol";

/// @title Track state of study and participant data
/// @author S0AndS0.eth
/// @custom:link https://www.elata.bio/
contract ZorpStudy is IZorpStudy_Functions, Ownable, ReentrancyGuard {
    uint256 public constant PARTICIPANT_STATUS__NA = 0;
    uint256 public constant PARTICIPANT_STATUS__SUBMITTED = 1;
    uint256 public constant PARTICIPANT_STATUS__PAID = 2;
    uint256 public constant PARTICIPANT_STATUS__INVALID = 3;

    uint256 public constant STUDY_STATUS__NA = 0;
    uint256 public constant STUDY_STATUS__ACTIVE = 1;
    uint256 public constant STUDY_STATUS__FINISHED = 2;

    address public immutable creator;

    uint256 public submissions;
    uint256 public invalidated;

    uint256 public study_status;
    uint256 public participant_payout_amount;

    string public encryption_key;

    mapping(address => uint256) public participant_status;
    mapping(address => uint256) public participant_index;
    mapping(uint256 => string) public submitted_data;

    /// @param initialOwner_ owner or admin of study
    /// @param encryption_key_ pointer to public GPG/PGP key
    constructor(
        address payable initialOwner_,
        string memory encryption_key_
    ) payable Ownable(initialOwner_) {
        require(msg.value > 0, "ZorpStudy: Invalid message value");
        // TODO: consider setting a constant minimum

        // Future: accept constructor args (e.g. merkleRoot, externalNullifier).
        encryption_key = encryption_key_;

        // TODO: consider checking sender has similar interface as `ZorpFactory` smart contract
        creator = msg.sender;
    }

    /// @inheritdoc IZorpStudy_Functions
    function submitData(string memory ipfs_cid) external {
        require(study_status == STUDY_STATUS__ACTIVE, "ZorpStudy: Study not active");

        // TODO: Investigate IPFS min/max byte lengths
        require(bytes(ipfs_cid).length > 0, "ZorpStudy: Invalid IPFS CID");

        require(participant_status[msg.sender] == PARTICIPANT_STATUS__NA, "ZorpStudy: Invalid message sender status");

        submitted_data[++submissions] = ipfs_cid;
        participant_status[msg.sender] = PARTICIPANT_STATUS__SUBMITTED;
        participant_index[msg.sender] = submissions;
    }

    /// @inheritdoc IZorpStudy_Functions
    function claimReward() external payable nonReentrant {
        require(study_status == STUDY_STATUS__FINISHED, "ZorpStudy: Study not finished");
        require(participant_status[msg.sender] == PARTICIPANT_STATUS__SUBMITTED, "ZorpStudy: Invalid message sender status");

        participant_status[msg.sender] = PARTICIPANT_STATUS__PAID;

        (bool success, ) = msg.sender.call{value: participant_payout_amount}("");
        require(success, "ZorpStudy: Failed participant payout");
    }

    /// @inheritdoc IZorpStudy_Functions
    function flagInvalidSubmission(address participant) external payable onlyOwner {
        require(study_status == STUDY_STATUS__ACTIVE, "ZorpStudy: Study not active");
        require(participant_status[participant] == PARTICIPANT_STATUS__SUBMITTED, "ZorpStudy: Invalid participant status");

        participant_status[participant] = PARTICIPANT_STATUS__INVALID;
        delete submitted_data[participant_index[participant]];
        delete participant_index[participant];

        ++invalidated;
    }

    /// @inheritdoc IZorpStudy_Functions
    function startStudy() external payable onlyOwner {
        require(study_status == STUDY_STATUS__NA, "ZorpStudy: Study was previously activated");
        study_status = STUDY_STATUS__ACTIVE;
    }

    /// @inheritdoc IZorpStudy_Functions
    function endStudy() external payable nonReentrant onlyOwner {
        require(study_status == STUDY_STATUS__ACTIVE, "ZorpStudy: Study not active");
        study_status = STUDY_STATUS__FINISHED;

        uint256 balance = address(this).balance;
        if (submissions > invalidated) {
            uint256 valid_submissions = submissions - invalidated;
            participant_payout_amount = balance / valid_submissions;

            uint256 remainder = balance - (participant_payout_amount * valid_submissions);
            if (remainder > 0) {
                (bool success, ) = msg.sender.call{value: remainder}("");
                require(success, "ZorpStudy: Failed trasfering remainder");
            }
        } else {
            (bool success, ) = msg.sender.call{value: balance}("");
            require(success, "ZorpStudy: Failed trasfering balance");
        }
    }

    receive() external payable {}
    fallback() external payable {}
}
