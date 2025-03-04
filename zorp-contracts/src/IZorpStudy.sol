// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IOwnable } from "./IOwnable.sol";

/// @title Publicly accessible stored states within `ZorpStudy`
interface IZorpStudy_Storage {
    /* Constants {{{ */
        /// @notice Default state for any `.participant_status(address)` that has not written to this `ZorpStudy` instance
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'PARTICIPANT_STATUS__NA()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.participant_status(address)` */
        /// ```
        function PARTICIPANT_STATUS__NA() external view returns (uint256);

        /// @notice Set in `.participant_status(address)` when appropriate
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'PARTICIPANT_STATUS__SUBMITTED()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.participant_status(address)` */
        /// ```
        function PARTICIPANT_STATUS__SUBMITTED() external view returns (uint256);

        /// @notice Set in `.participant_status(address)` when appropriate
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'PARTICIPANT_STATUS__PAID()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.participant_status(address)` */
        /// ```
        function PARTICIPANT_STATUS__PAID() external view returns (uint256);

        /// @notice Set in `.participant_status(address)` when appropriate
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'PARTICIPANT_STATUS__INVALID()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.participant_status(address)` */
        /// ```
        function PARTICIPANT_STATUS__INVALID() external view returns (uint256);

        /// @notice Default state for `.study_status()` that has not yet been activated
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'STUDY_STATUS__NA()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.study_status()` */
        /// ```
        function STUDY_STATUS__NA() external view returns (uint256);

        /// @notice Set in `.study_status()` when appropriate
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'STUDY_STATUS__ACTIVE()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.study_status()` */
        /// ```
        function STUDY_STATUS__ACTIVE() external view returns (uint256);

        /// @notice Set in `.study_status()` when appropriate
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'STUDY_STATUS__FINISHED()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.study_status()` */
        /// ```
        function STUDY_STATUS__FINISHED() external view returns (uint256);
    /* Constants }}} */

    /* Immutable {{{ */
        /// @notice Pointer to factory contract that created this study
        /// @return `ZorpFactory` contract address
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'creator()(address)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function creator() external view returns (address);
    /* Immutable }}} */

    /* Mutable {{{ */
        /// @notice Combo with querying `.invalidated()`, `.invalidated()` to estimate payout before `.participant_payout_amount()` is defined
        /// @return Count of total submissions
        ///
        /// @dev see `.submitData(string)` for when this may be mutated
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'submissions()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function submissions() external view returns (uint256);

        /// @notice Combo with querying `.invalidated()`, `.invalidated()` to estimate payout before `.participant_payout_amount()` is defined
        /// @return Count of invalid submissions
        ///
        /// @dev see `.flagInvalidSubmission(address)` for when this may be mutated
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'invalidated()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function invalidated() external view returns (uint256);

        /// @notice To prevent wasting gas it is a _good idea_ to query this before attempting to execute `.submitData(string)`
        /// @return Numerical value of this `ZorpStudy` instance's status
        ///
        /// @dev see `STUDY_STATUS__` constants
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'study_status()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function study_status() external view returns (uint256);

        /// @notice Stores the per-participant payment amount when `.endStudy()` is called
        /// @return Amount each participant may claim for valid data submission.  Or `0` when `.study_status()` is not `STUDY_STATUS__FINISHED`
        ///
        /// @dev see `ZorpStudy.endStudy` for when this is set and how
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// STUDY_STATUS__FINISHED="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'STUDY_STATUS__FINISHED()(uint256)' )";
        ///
        /// zorp_study_status="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'study_status()(uint256)' )";
        ///
        /// if [[ "${STUDY_STATUS__FINISHED}" == "${zorp_study_status}" ]]; then
        ///     cast call "${zorp_study_address}" \
        ///         --rpc-url 127.0.0.1:8545 \
        ///         'participant_payout_amount()(uint256)';
        /// else
        ///     printf >&2 'ZorpStudy not finished, current status -> %s\n' "${zorp_study_status}";
        /// fi
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function participant_payout_amount() external view returns (uint256);

        /// @notice This is what each participant should download and use when encrypting data **prior** to uploading and submitting the upload s CID to `.submitData(string)'
        /// @return Pointer to GPG/PGP public key that submissions are to be encrypted with
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'encryption_key()(string)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see `.submitData(string)` */
        /// ```
        function encryption_key() external view returns (string memory);

        /// @notice
        /// @param participant
        /// @return
        ///
        /// @dev see `PARTICIPANT_STATUS__` constants
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// zorp_study_good_participant="0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'participant_status(address)(uint256)' \
        ///         "${zorp_study_good_participant}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function participant_status(address participant) external view returns (uint256);

        /// @notice Maybe get an index for given participant
        /// @param participant
        /// @return Index pointing into `submitted_data` mapping
        ///
        /// @dev Index `0` should always point to nonexistent participant(s)
        /// @dev Index `0` should always point to flagged participant(s)
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// zorp_study_good_participant="0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'participant_index(address)(uint256)' \
        ///         "${zorp_study_good_participant}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function participant_index(address participant) external view returns (uint256);

        /// @notice Get submitted data for given participant address
        /// @param index
        /// @return IPFS CID string
        ///
        /// @dev Index `0` should always be empty string
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// zorp_study_index="42";
        ///
        /// cast call "${zorp_study_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'submitted_data(uint256)(string)' \
        ///         "${zorp_study_index}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function submitted_data(uint256 index) external view returns (string memory);
    /* Mutable }}} */
}

/// @title Executable logic for `ZorpStudy`
interface IZorpStudy_Functions {
    /* Public {{{ */
        /// @notice Store `ipfs_cid` in `ZorpStudy.submitted_data`
        ///
        /// @custom:throw `ZorpStudy: Study not active`
        /// @custom:throw `ZorpStudy: Invalid IPFS CID`
        /// @custom:throw `ZorpStudy: Invalid message sender status`
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// set -eET
        ///
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// test_private_key1='0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
        /// zorp_study_ipfs_cid="0x...BOBATEA";
        /// irys_gateway="https://gateway.irys.xyz/ipfs"
        /// irys_private_key="<YOUR_IRYS_PRIVATE_KEY>"
        /// my_data="<PATH_TO_A_FILE>"
        ///
        /// STUDY_STATUS__ACTIVE="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'STUDY_STATUS__ACTIVE()(uint256)' )";
        ///
        /// zorp_study_status="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'study_status()(uint256)' )";
        ///
        /// if [[ "${STUDY_STATUS__ACTIVE}" == "${zorp_study_status}" ]]; then
        ///     encryption_key_cid="$( cast call "${zorp_study_address}"
        ///         --rpc-url 127.0.0.1:8545
        ///         'encryption_key()(string)' )";
        ///
        ///     curl -o "${encryption_key_cid}" "${irys_gateway}/${encryption_key_cid}";
        ///
        ///     ## Tip: consider encrypting data to yourself at the same time by adding `--recipient <EMAIL>`
        ///     gpg --batch --yes --encrypt \
        ///         --trust-model always \
        ///         --recipient-file "${encryption_key_cid}" \
        ///         --output "${my_data}.gpg" \
        ///         "${my_data}";
        ///
        ///     ## TODO: double-check expectations of fallowing result
        ///     zorp_study_ipfs_cid="$( irys upload "${my_data}.gpg"
        ///         -n devnet
        ///         -t base
        ///         -w "${irys_private_key}"
        ///         --provider-url "private_key" )";
        ///
        ///     cast call "${zorp_study_address}" \
        ///         --rpc-url 127.0.0.1:8545 \
        ///         --private-key "${test_private_key1}" \
        ///         'submitData()' \
        ///             "${zorp_study_ipfs_cid}";
        /// else
        ///     printf >&2 'ZorpStudy not active, current status -> %s\n' "${zorp_study_status}";
        /// fi
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function submitData(string memory ipfs_cid) external;

        /// @notice Pay `ZorpStudy.participant_payout_amount` to `msg.sender`
        ///
        /// @custom:throw `ZorpStudy: Study not finished`
        /// @custom:throw `ZorpStudy: Invalid message sender status`
        /// @custom:throw `ZorpStudy: Failed participant payout`
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// test_private_key1='0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
        ///
        /// STUDY_STATUS__FINISHED="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'STUDY_STATUS__ACTIVE()(uint256)' )";
        ///
        /// zorp_study_status="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'study_status()(uint256)' )";
        ///
        /// if [[ "${STUDY_STATUS__FINISHED}" == "${zorp_study_status}" ]]; then
        ///     cast call "${zorp_study_address}" \
        ///         --rpc-url 127.0.0.1:8545 \
        ///         --private-key "${test_private_key1}" \
        ///         'claimReward()';
        /// else
        ///     printf >&2 'ZorpStudy not finished, current status -> %s\n' "${zorp_study_status}";
        /// fi
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function claimReward() external payable;
    /* Public }}} */

    /* Owner {{{ */
        /// @notice Set `PARTICIPANT_STATUS__INVALID` for address, then delete associated storage in `participant_index` and `submitted_data`
        ///
        /// @custom:throw `ZorpStudy: Study not active`
        /// @custom:throw `ZorpStudy: Invalid participant status`
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        /// zorp_study_bad_participant="0xa0Ee7A142d267C1f36714E4a8F75612F20a79720";
        ///
        /// PARTICIPANT_STATUS__SUBMITTED="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'PARTICIPANT_STATUS__SUBMITTED()(uint256)' )";
        ///
        /// participant_status="$( "cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'participant_status(address)(uint256)'
        ///         "${zorp_study_bad_participant}" )"";
        ///
        /// if [[ "${PARTICIPANT_STATUS__SUBMITTED}" == "${participant_status}" ]]; then
        ///     cast call "${zorp_study_address}" \
        ///         --rpc-url 127.0.0.1:8545 \
        ///         --private-key "${test_private_key0}" \
        ///         'flagInvalidSubmission(address)' \
        ///             "${zorp_study_bad_participant}"
        /// else
        ///     printf >&2 'ZorpStudy participant has not submitted data, current status -> %s\n' "${participant_status}";
        /// fi
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function flagInvalidSubmission(address participant) external payable;

        /// @notice Set `STUDY_STATUS__ACTIVE` in `ZorpStudy.study_status`
        ///
        /// @custom:throw `ZorpStudy: Study was previously activated`
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        ///
        /// STUDY_STATUS__NA="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'STUDY_STATUS__NA()(uint256)' )";
        ///
        /// zorp_study_status="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'study_status()(uint256)' )";
        ///
        /// if [[ "${STUDY_STATUS__NA}" == "${zorp_study_status}" ]]; then
        ///     cast call "${zorp_study_address}" \
        ///         --rpc-url 127.0.0.1:8545 \
        ///         --private-key "${test_private_key0}" \
        ///         'startStudy()';
        /// else
        ///     printf >&2 'ZorpStudy not inactive, current status -> %s\n' "${zorp_study_status}";
        /// fi
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function startStudy() external payable;

        /// @notice Set `STUDY_STATUS__FINISHED` in `ZorpStudy.study_status`
        ///
        /// @custom:throw `ZorpStudy: Study not active`
        /// @custom:throw `ZorpStudy: Failed trasfering remainder`
        /// @custom:throw `ZorpStudy: Failed trasfering balance`
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_study_address="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        /// test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        ///
        /// STUDY_STATUS__ACTIVE="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'STUDY_STATUS__ACTIVE()(uint256)' )";
        ///
        /// zorp_study_status="$( cast call "${zorp_study_address}"
        ///     --rpc-url 127.0.0.1:8545
        ///     'study_status()(uint256)' )";
        ///
        /// if [[ "${STUDY_STATUS__ACTIVE}" == "${zorp_study_status}" ]]; then
        ///     cast call "${zorp_study_address}" \
        ///         --rpc-url 127.0.0.1:8545 \
        ///         --private-key "${test_private_key0}" \
        ///         'endStudy()';
        /// else
        ///     printf >&2 'ZorpStudy not active, current status -> %s\n' "${zorp_study_status}";
        /// fi
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// ```
        function endStudy() external payable;
    /* Owner }}} */
}

/// @title Organize any inherited contracts that also contain publicly accessible functions/storage
interface IZorpStudy_Inherited is IOwnable {}

/// @title On/Off chain consumers of `ZorpStudy` may wish to use this interface
/// @author wkyleg
/// @author S0AndS0
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
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
///
/// @custom:file ./ZorpStudy.sol
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
interface IZorpStudy is IZorpStudy_Storage, IZorpStudy_Functions, IZorpStudy_Inherited {}
