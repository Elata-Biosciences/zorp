// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title Publicly accessible stored states within `ZorpStudy`
interface IZorpStudy_Storage {
    /* Constants {{{ */
        function PARTICIPANT_STATUS__NA() external view returns (uint256);
        function PARTICIPANT_STATUS__SUBMITTED() external view returns (uint256);
        function PARTICIPANT_STATUS__PAID() external view returns (uint256);
        function PARTICIPANT_STATUS__INVALID() external view returns (uint256);

        function STUDY_STATUS__NA() external view returns (uint256);
        function STUDY_STATUS__ACTIVE() external view returns (uint256);
        function STUDY_STATUS__FINISHED() external view returns (uint256);
    /* Constants }}} */

    /* Immutable {{{ */
        /// Pointer to factory contract that created this study
        function creator() external view returns (address);
    /* Immutable }}} */

    /* Mutable {{{ */
        /// Count of total submissions
        function submissions() external view returns (uint256);

        /// Count of invalid submissions
        function invalidated() external view returns (uint256);

        /// See `STUDY_STATUS__` constants
        function study_status() external view returns (uint256);

        /// See `ZorpStudy.endStudy` for when this is set and how
        function participant_payout_amount() external view returns (uint256);

        /// Pointer to GPG/PGP public key that submissions are to be encrypted with
        function encryptionKey() external view returns (string memory);

        /// See `PARTICIPANT_STATUS__` constants
        function participant_status(address) external view returns (uint256);

        /// See `Participant` data structure
        function participants(uint256) external view returns (address, string memory);
    /* Mutable }}} */
}

/// @title Executable logic for `ZorpStudy`
interface IZorpStudy_Functions {
    /* Public {{{ */
        ///
        function submitData(string memory ipfs_cid) external;

        ///
        function claimReward() external payable;
    /* Public }}} */

    /* Owner {{{ */
        ///
        function flagInvalidSubmission(address participant) external payable;

        ///
        function startStudy() external payable;

        ///
        function endStudy() external payable;
    /* Owner }}} */
}

/// @title On/Off chain consumers of `ZorpStudy` may wish to use this interface
///
/// ## On-chain example
///
/// ```solidity
/// import { IZorpStudy } from "<NAME_SPACE>/src/IZorpStudy.sol";
///
/// contract View_ZorpStudy {
///     getParticipantStatus(
///         address study,
///         address participant
///     ) external view returns (uint256) {
///         return IZorpStudy(study).participant_status(participant);
///     }
/// }
/// ```
interface IZorpStudy is IZorpStudy_Storage, IZorpStudy_Functions {}
