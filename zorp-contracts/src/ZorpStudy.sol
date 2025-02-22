// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

struct Participant {
    address account;
    string ipfs_cid;
}

/// @custom:link https://docs.ipfs.tech/how-to/address-ipfs-on-web/
/// @custom:link https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#encrypt-and-decrypt-string-data-with-pgp-keys
/// @custom:link https://github.com/ethereum/solidity/issues/11278 
contract ZorpStudy is Ownable, ReentrancyGuard {
    uint256 public constant PARTICIPANT_STATUS__NA = 0;
    uint256 public constant PARTICIPANT_STATUS__SUBMITTED = 1;
    uint256 public constant PARTICIPANT_STATUS__INVALID = 2;

    uint256 public constant STUDY_STATUS__NA = 0;
    uint256 public constant STUDY_STATUS__ACTIVE = 1;
    uint256 public constant STUDY_STATUS__FINISHED = 2;

    /// Pointer to GPG/PGP public key that submissions are to be encrypted with
    string public encryptionKey;

    /// Submissions total
    uint256 public submissions;
    /// Submissions that are invalidated
    uint256 public invalidated;
    /// See `PARTICIPANT_STATUS__` constants
    mapping(address => uint256) public participant_status;
    /// See `Participant` data structure
    mapping(uint256 => Participant) public participants;

    /// See `STUDY_STATUS__` constants
    uint256 public study_status;

    // In the real version, you'd store:
    //   - [X] ~~merkleRoot~~ GPG/PGP public key pointer; IPFS CID, Key fingerprint, email address, etc
    //   - token type (ETH vs. native token)
    //   - [X] admin or owner
    //   - [ ] submission data, IPFS CID pointing to data encrypted with `this.encryptionKey` as recipient

    // Minimal placeholder for submissions. In the future, you might store:
    // struct Submission {
    //     string ipfsCID;
    //     bool valid;
    // }
    // Submission[] public submissions;

    /// @param initialOwner_ owner or admin of study
    /// @param encryptionKey_ pointer to public GPG/PGP key
    constructor(
        address initialOwner_,
        string memory encryptionKey_
    ) Ownable(initialOwner_) {
        // Future: accept constructor args (e.g. merkleRoot, externalNullifier).
        encryptionKey = encryptionKey_;
    }

    function submitData(
        string memory ipfs_cid
    ) external {
        require(study_status == STUDY_STATUS__ACTIVE, "ZorpStudy: Study not active");

        // TODO: https://github.com/ipfs/kubo/issues/4918
        //       Investigate IPFS min/max byte lengths
        require(bytes(ipfs_cid).length > 0, "ZorpStudy: Invalid IPFS CID");

        require(participant_status[msg.sender] == PARTICIPANT_STATUS__NA, "ZorpStudy: Invalid status for message sender");

        Participant memory participant;
        participant.account = msg.sender;
        participant.ipfs_cid = ipfs_cid;

        participants[++submissions] = participant;
        participant_status[msg.sender] = PARTICIPANT_STATUS__SUBMITTED;
    }

    function flagInvalidSubmission(address participant) external payable onlyOwner {
        require(study_status == STUDY_STATUS__ACTIVE, "ZorpStudy: Not active");
        require(participant_status[participant] == PARTICIPANT_STATUS__SUBMITTED, "ZorpStudy: Invalid status for participant");
        participant_status[participant] = PARTICIPANT_STATUS__INVALID;
        ++invalidated;
    }

    function startStudy() external payable onlyOwner {
        require(study_status == STUDY_STATUS__NA, "ZorpStudy: Study was previously activated");
        study_status = STUDY_STATUS__ACTIVE;
    }

    function endStudy() external payable onlyOwner {
        require(study_status == STUDY_STATUS__ACTIVE, "ZorpStudy: Study not active");
        study_status = STUDY_STATUS__FINISHED;
    }

    function claimReward() external payable {
        uint status = participant_status[msg.sender];
        require(status != PARTICIPANT_STATUS__NA && status != PARTICIPANT_STATUS__INVALID, "ZorpStudy: Invalid status for message sender");
    }
}
