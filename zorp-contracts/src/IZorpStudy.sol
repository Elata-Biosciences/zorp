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

        /// @dev Index `0` should always point to `address(0)`
        function participant_index(address) external view returns (uint256);

        /// @dev Index `0` should always be empty
        function submitted_data(uint256) external view returns (string memory);
    /* Mutable }}} */
}

/// @title Executable logic for `ZorpStudy`
interface IZorpStudy_Functions {
    /* Public {{{ */
        /// Store `ipfs_cid` in `ZorpStudy.submitted_data`
        ///
        /// @custom:throw `ZorpStudy: Study not active`
        /// @custom:throw `ZorpStudy: Invalid IPFS CID`
        /// @custom:throw `ZorpStudy: Invalid message sender status`
        function submitData(string memory ipfs_cid) external;

        /// Pay `ZorpStudy.participant_payout_amount` to `msg.sender`
        ///
        /// @custom:throw `ZorpStudy: Study not finished`
        /// @custom:throw `ZorpStudy: Invalid message sender status`
        /// @custom:throw `ZorpStudy: Failed participant payout`
        function claimReward() external payable;
    /* Public }}} */

    /* Owner {{{ */
        /// Set `PARTICIPANT_STATUS__INVALID` for address, then delete
        /// associated storage in `participant_index` and `submitted_data`
        ///
        /// @custom:throw `ZorpStudy: Study not active`
        /// @custom:throw `ZorpStudy: Invalid participant status`
        function flagInvalidSubmission(address participant) external payable;

        /// Set `STUDY_STATUS__ACTIVE` in `ZorpStudy.study_status`
        ///
        /// @custom:throw `ZorpStudy: Study was previously activated`
        function startStudy() external payable;

        /// Set `STUDY_STATUS__FINISHED` in `ZorpStudy.study_status`
        ///
        /// @custom:throw `ZorpStudy: Study not active`
        /// @custom:throw `ZorpStudy: Failed trasfering remainder`
        /// @custom:throw `ZorpStudy: Failed trasfering balance`
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
