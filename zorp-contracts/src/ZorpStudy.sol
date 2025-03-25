// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import {
    IZorpStudy_Functions,
    InvalidIPFSCID,
    InvalidMessageValue,
    InvalidParticipantState,
    InvalidStudyState,
    ParticipantPayoutFailed,
    RemainderTransferFailed
} from "./IZorpStudy.sol";

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
        // TODO: consider setting a constant minimum
        if (msg.value < 1) {
            revert InvalidMessageValue(msg.value, 1);
        }

        // Future: accept constructor args (e.g. merkleRoot, externalNullifier).
        encryption_key = encryption_key_;

        // TODO: consider checking sender has similar interface as `ZorpFactory` smart contract
        creator = msg.sender;
    }

    /// @inheritdoc IZorpStudy_Functions
    function submitData(string memory ipfs_cid) external {
        if (study_status != STUDY_STATUS__ACTIVE) {
            revert InvalidStudyState(study_status, STUDY_STATUS__ACTIVE);
        }

        if (bytes(ipfs_cid).length < 1) {
            revert InvalidIPFSCID();
        }

        if (participant_status[msg.sender] != PARTICIPANT_STATUS__NA) {
            revert InvalidParticipantState(participant_status[msg.sender], PARTICIPANT_STATUS__NA);
        }

        submitted_data[++submissions] = ipfs_cid;
        participant_status[msg.sender] = PARTICIPANT_STATUS__SUBMITTED;
        participant_index[msg.sender] = submissions;
    }

    /// @inheritdoc IZorpStudy_Functions
    function claimReward() external payable nonReentrant {
        if (study_status != STUDY_STATUS__FINISHED) {
            revert InvalidStudyState(study_status, STUDY_STATUS__FINISHED);
        }

        if (participant_status[msg.sender] != PARTICIPANT_STATUS__SUBMITTED) {
            revert InvalidParticipantState(participant_status[msg.sender], PARTICIPANT_STATUS__SUBMITTED);
        }

        participant_status[msg.sender] = PARTICIPANT_STATUS__PAID;

        (bool success, ) = msg.sender.call{ value: participant_payout_amount }("");
        if (!success) {
            revert ParticipantPayoutFailed(msg.sender, participant_payout_amount, address(this).balance);
        }
    }

    /// @inheritdoc IZorpStudy_Functions
    function flagInvalidSubmission(address participant) external payable onlyOwner {
        if (study_status != STUDY_STATUS__ACTIVE) {
            revert InvalidStudyState(study_status, STUDY_STATUS__ACTIVE);
        }

        if (participant_status[participant] != PARTICIPANT_STATUS__SUBMITTED) {
            revert InvalidParticipantState(participant_status[participant], PARTICIPANT_STATUS__SUBMITTED);
        }

        participant_status[participant] = PARTICIPANT_STATUS__INVALID;
        delete submitted_data[participant_index[participant]];
        delete participant_index[participant];

        ++invalidated;
    }

    /// @inheritdoc IZorpStudy_Functions
    function startStudy() external payable onlyOwner {
        if (study_status != STUDY_STATUS__NA) {
            revert InvalidStudyState(study_status, STUDY_STATUS__NA);
        }

        study_status = STUDY_STATUS__ACTIVE;
    }

    /// @inheritdoc IZorpStudy_Functions
    function endStudy() external payable nonReentrant onlyOwner {
        if (study_status != STUDY_STATUS__ACTIVE) {
            revert InvalidStudyState(study_status, STUDY_STATUS__ACTIVE);
        }

        study_status = STUDY_STATUS__FINISHED;

        if (submissions > invalidated) {
            uint256 balance = address(this).balance;
            uint256 valid_submissions = submissions - invalidated;
            if (valid_submissions > 0) {
                participant_payout_amount = balance / valid_submissions;
            } else {
                participant_payout_amount = balance;
            }

            uint256 remainder = balance - (participant_payout_amount * valid_submissions);
            if (remainder > 0) {
                (bool success, ) = msg.sender.call{ value: remainder }("");
                if (!success) {
                    revert RemainderTransferFailed(msg.sender, remainder, address(this).balance);
                }
            }
        } else {
            (bool success, ) = msg.sender.call{ value: address(this).balance }("");
            if (!success) {
                revert RemainderTransferFailed(msg.sender, address(this).balance, address(this).balance);
            }
        }
    }

    receive() external payable {}
    fallback() external payable {}
}
