// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IOwnable } from "./IOwnable.sol";

error InvalidIPFSCID();
error InvalidMessageValue(uint256 value, uint256 minimum);
error InvalidParticipantState(uint256 current_state, uint256 required_state);
error InvalidStudyState(uint256 current_state, uint256 required_state);
error ParticipantPayoutFailed(address to, uint256 amount, uint256 balance);
error RemainderTransferFailed(address to, uint256 amount, uint256 balance);

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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadCreator() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { data: creator, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'creator',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy creator address: {creator as `0x${string}`}</span>
        ///     </>
        ///   );
        /// }
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadSubmissions() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { data: submissions, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'submissions',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy submissions count: {submissions as string}</span>
        ///     </>
        ///   );
        /// }
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadInvalidated() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { data: invalidated, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'invalidated',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy invalidated count: {invalidated as string}</span>
        ///     </>
        ///   );
        /// }
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadStudyStatus() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { data: study_status, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'study_status',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy status: {study_status as string}</span>
        ///     </>
        ///   );
        /// }
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadParticipantPayoutAmount() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { data: participant_payout_amount, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'participant_payout_amount',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy per-participant payout: {participant_payout_amount as string}</span>
        ///     </>
        ///   );
        /// }
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadEncryptionKeyCid() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { data: encryption_key_cid, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'encryption_key',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy encryption key CID: {encryption_key_cid as string}</span>
        ///     </>
        ///   );
        /// }
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadParticipantStatus() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
        ///
        ///   const addressStudyId = useId();
        ///   const addressParticipantId = useId();
        ///
        ///   const { data: participant_status, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'participant_status',
        ///     args: [addressParticipant],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x')
        ///             && addressParticipant.length === addressStudyAnvil.length
        ///             && addressParticipant.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={addressParticipantId}>ZORP Participant Address:</label>
        ///       <input
        ///         id={addressParticipantId}
        ///         value={addressParticipant}
        ///         onChange={(event) => {
        ///           setAddressParticipant(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy participant status: {participant_status as string}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function participant_status(address participant) external view returns (uint256);

        /// @notice Maybe get an index for given participant
        /// @param participant Address of possible `ZorpStudy` participant
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadParticipantIndex() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
        ///
        ///   const addressStudyId = useId();
        ///   const addressParticipantId = useId();
        ///
        ///   const { data: participant_index, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'participant_index',
        ///     args: [addressParticipant],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x')
        ///             && addressParticipant.length === addressStudyAnvil.length
        ///             && addressParticipant.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={addressParticipantId}>ZORP Participant Address:</label>
        ///       <input
        ///         id={addressParticipantId}
        ///         value={addressParticipant}
        ///         onChange={(event) => {
        ///           setAddressParticipant(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy participant index: {participant_index as string}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function participant_index(address participant) external view returns (uint256);

        /// @notice Maybe get an address of given participant from provided index
        /// @param index Key of possible `ZorpStudy` participant
        /// @return Address pointing into `participant_status` and `participant_index` mappings
        ///
        /// @dev Index `0` should always point to nonexistent participant(s)
        /// @dev Index `0` should always point to flagged participant(s)
        /// @dev Address `0` should always point to nonexistent and/or flagged participant(s)
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadIndexParticipant() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [indexParticipant, setIndexParticipant] = useState<bigint | number>(0);
        ///
        ///   const addressStudyId = useId();
        ///   const indexParticipantId = useId();
        ///
        ///   const { data: participant, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'index_participant',
        ///     args: [indexParticipant],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x')
        ///             && !Number.isNaN(indexParticipant),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={indexParticipantId}>ZORP Participant Index:</label>
        ///       <input
        ///         id={indexParticipantId}
        ///         value={
        ///           indexParticipant == null
        ///             ? 'NaN'
        ///             : indexParticipant.toString()
        ///         }
        ///         onChange={(event) => {
        ///           if (!(new RegExp('^[0-9]+$')).test(event.target.value))
        ///             return;
        ///           }
        ///
        ///           const value = BigInt(event.target.value);
        ///           if (Number.isNaN(value)) {
        ///             return;
        ///           }
        ///
        ///           setIndexParticipant(value);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy participant address: {participant as `0x${string}`}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function index_participant(uint256 index) external view returns (address);

        /// @notice Get submitted data for given participant address
        /// @param index Key into mapping to attempt getting data from
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyReadSubmittedData() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [index, setIndex] = useState<number>(0);
        ///
        ///   const addressStudyId = useId();
        ///   const indexId = useId();
        ///
        ///   const { data: submitted_data, isFetching } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'submitted_data',
        ///     args: [index],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x')
        ///             && !!index
        ///             && index > 0
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={indexId}>ZORP data index:</label>
        ///       <input
        ///         id={indexId}
        ///         value={index}
        ///         onChange={(event) => {
        ///           const value = Number.parseInt(event.target.value);
        ///           if (!isNaN(value)) {
        ///             setIndex(value);
        ///           }
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpStudy data CID: {
        ///         !!(submitted_data as string)?.length ? submitted_data as string : 'null'
        ///       }</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function submitted_data(uint256 index) external view returns (string memory);
    /* Mutable }}} */
}

/// @title Executable logic for `ZorpStudy`
interface IZorpStudy_Functions {
    /* Public {{{ */
        /// @notice Store `ipfs_cid` in `ZorpStudy.submitted_data`
        ///
        /// @custom:throws `InvalidStudyState(uint256 current_state, uint256 required_state)`
        /// @custom:throws `InvalidIPFSCID()`
        /// @custom:throws `InvalidParticipantState(uint256 current_state, uint256 required_state)`
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
        /// @custom:throws `InvalidStudyState(uint256 current_state, uint256 required_state)`
        /// @custom:throws `InvalidParticipantState(uint256 current_state, uint256 required_state)`
        /// @custom:throws `ParticipantPayoutFailed(address to, uint256 amount, uint256 balance)`
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useAccount, useReadContract, useWriteContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyWriteClaimReward() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [isFetching, setIsFetching] = useState<boolean>(false);
        ///   const [receipt, setReceipt] = useState<string>('... pending');
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { address, isConnected } = useAccount();
        ///   const { writeContractAsync } = useWriteContract();
        ///
        ///   const { data: participant_status, isFetching: isFetchingParticipantStatus } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'participant_status',
        ///     args: [address],
        ///     query: {
        ///       enabled: isConnected
        ///             && addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'study_status',
        ///     args: [],
        ///     query: {
        ///       enabled: addressStudy.length === addressStudyAnvil.length
        ///             && addressStudy.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   const disabled = isFetching
        ///                 || isFetchingParticipantStatus
        ///                 || isFetchingStudyStatus
        ///                 || !isConnected;
        ///
        ///   const enabled = isConnected
        ///                 && addressStudy.length === addressStudyAnvil.length
        ///                 && addressStudy.startsWith('0x')
        ///                 && !!address
        ///                 && address.length === addressStudyAnvil.length
        ///                 && address.startsWith('0x')
        ///                 && participant_status == 1
        ///                 && study_status == 2;
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={disabled}
        ///       />
        ///
        ///       <button
        ///         onClick={(event) => {
        ///           event.preventDefault();
        ///           event.stopPropagation();
        ///
        ///           if (!enabled) {
        ///             console.warn('Missing required state', { addressStudy, address, participant_status, study_status });
        ///             return;
        ///           }
        ///
        ///           setIsFetching(true);
        ///           writeContractAsync({
        ///             address: addressStudy,
        ///             abi: zorpStudyAbi,
        ///             functionName: 'claimReward',
        ///             args: [],
        ///           }).then((response) => {
        ///             if (!!response) {
        ///               setReceipt(response);
        ///             } else {
        ///               setReceipt(`...  error with receipt response -> ${response}`);
        ///             }
        ///           }).catch((error) => {
        ///             console.error(error);
        ///             setReceipt(`...  error with writeContractAsync error -> ${error}`);
        ///           }).finally(() => {
        ///             setIsFetching(false);
        ///           });
        ///         }}
        ///         disabled={disabled}
        ///       >Claim Reward {enabled ? 'Available' : 'unavailable'}</button>
        ///
        ///       <span>ZorpStudy claim reward receipt: {receipt}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function claimReward() external payable;
    /* Public }}} */

    /* Owner {{{ */
        /// @notice Set `PARTICIPANT_STATUS__INVALID` for address, then delete associated storage in `participant_index` and `submitted_data`
        ///
        /// @custom:throws `InvalidStudyState(uint256 current_state, uint256 required_state)`
        /// @custom:throws `InvalidParticipantState(uint256 current_state, uint256 required_state)`
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useAccount, useReadContract, useWriteContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyWriteFlagInvalidSubmission() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
        ///   const [isFetching, setIsFetching] = useState<boolean>(false);
        ///   const [receipt, setReceipt] = useState<string>('... pending');
        ///
        ///   const addressStudyId = useId();
        ///   const addressParticipantId = useId();
        ///
        ///   const { address, isConnected } = useAccount();
        ///   const { writeContractAsync } = useWriteContract();
        ///
        ///   const assertsClient = {
        ///     isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
        ///     isAddressParticipantSet: addressParticipant.length === addressStudyAnvil.length && addressParticipant.startsWith('0x'),
        ///     isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
        ///   };
        ///
        ///   const { data: owner, isFetching: isFetchingOwner } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'owner',
        ///     args: [],
        ///     query: {
        ///       enabled: assertsClient.isAddressStudySet,
        ///     },
        ///   });
        ///
        ///   const { data: participant_status, isFetching: isFetchingParticipantStatus } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'participant_status',
        ///     args: [addressParticipant],
        ///     query: {
        ///       enabled: isConnected
        ///             && assertsClient.isAddressStudySet
        ///             && assertsClient.isAddressParticipantSet,
        ///     },
        ///   });
        ///
        ///   const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'study_status',
        ///     args: [],
        ///     query: {
        ///       enabled: assertsClient.isAddressStudySet,
        ///     },
        ///   });
        ///
        ///   const assertsBlockchain = {
        ///     isAddressOwnerSet: !!(owner as `0x${string}`)
        ///                     && (owner as `0x${string}`).length === addressStudyAnvil.length
        ///                     && (owner as `0x${string}`).startsWith('0x'),
        ///     isStudyOwner: address == owner,
        ///     isParticipantSubmitted: participant_status == 1,
        ///     isStudyActive: study_status == 1,
        ///   };
        ///
        ///   const disabled = isFetching
        ///                 || isFetchingOwner
        ///                 || isFetchingParticipantStatus
        ///                 || isFetchingStudyStatus
        ///                 || !isConnected;
        ///
        ///   const enabled = isConnected
        ///                 && assertsClient.isAddressStudySet
        ///                 && assertsClient.isAddressParticipantSet
        ///                 && assertsClient.isAddressWalletSet
        ///                 && assertsBlockchain.isAddressOwnerSet
        ///                 && assertsBlockchain.isStudyOwner
        ///                 && assertsBlockchain.isParticipantSubmitted
        ///                 && assertsBlockchain.isStudyActive;
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={disabled}
        ///       />
        ///
        ///       <label htmlFor={addressParticipantId}>ZORP Participant Address:</label>
        ///       <input
        ///         id={addressParticipantId}
        ///         value={addressParticipant}
        ///         onChange={(event) => {
        ///           setAddressParticipant(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={disabled}
        ///       />
        ///
        ///       <button
        ///         onClick={(event) => {
        ///           event.preventDefault();
        ///           event.stopPropagation();
        ///
        ///           if (!enabled) {
        ///             console.warn('Missing required state', {
        ///               isConnected,
        ///               assertsClient,
        ///               assertsBlockchain,
        ///             });
        ///             return;
        ///           }
        ///
        ///           setIsFetching(true);
        ///           writeContractAsync({
        ///             address: addressStudy,
        ///             abi: zorpStudyAbi,
        ///             functionName: 'flagInvalidSubmission',
        ///             args: [addressParticipant],
        ///           }).then((response) => {
        ///             if (!!response) {
        ///               setReceipt(response);
        ///             } else {
        ///               setReceipt(`...  error with receipt response -> ${response}`);
        ///             }
        ///           }).catch((error) => {
        ///             console.error(error);
        ///             setReceipt(`...  error with writeContractAsync error -> ${error}`);
        ///           }).finally(() => {
        ///             setIsFetching(false);
        ///           });
        ///         }}
        ///         disabled={disabled}
        ///       >Flag Submission {enabled ? 'Available' : 'unavailable'}</button>
        ///
        ///       <span>ZorpStudy flag invalid submission receipt: {receipt}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function flagInvalidSubmission(address participant) external payable;

        /// @notice Set `STUDY_STATUS__ACTIVE` in `ZorpStudy.study_status`
        ///
        /// @custom:throws `InvalidStudyState(uint256 current_state, uint256 required_state)`
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useAccount, useReadContract, useWriteContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyWriteStartStudy() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [isFetching, setIsFetching] = useState<boolean>(false);
        ///   const [receipt, setReceipt] = useState<string>('... pending');
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { address, isConnected } = useAccount();
        ///   const { writeContractAsync } = useWriteContract();
        ///
        ///   const assertsClient = {
        ///     isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
        ///     isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
        ///   };
        ///
        ///   const { data: owner, isFetching: isFetchingOwner } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'owner',
        ///     args: [],
        ///     query: {
        ///       enabled: assertsClient.isAddressStudySet,
        ///     },
        ///   });
        ///
        ///   const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'study_status',
        ///     args: [],
        ///     query: {
        ///       enabled: assertsClient.isAddressStudySet,
        ///     },
        ///   });
        ///
        ///   const assertsBlockchain = {
        ///     isAddressOwnerSet: !!(owner as `0x${string}`)
        ///                     && (owner as `0x${string}`).length === addressStudyAnvil.length
        ///                     && (owner as `0x${string}`).startsWith('0x'),
        ///     isStudyOwner: address == owner,
        ///     isStudyInactive: study_status == 0,
        ///   };
        ///
        ///   const disabled = isFetching
        ///                 || isFetchingOwner
        ///                 || isFetchingStudyStatus
        ///                 || !isConnected;
        ///
        ///   const enabled = isConnected
        ///                 && assertsClient.isAddressStudySet
        ///                 && assertsClient.isAddressWalletSet
        ///                 && assertsBlockchain.isAddressOwnerSet
        ///                 && assertsBlockchain.isStudyOwner
        ///                 && assertsBlockchain.isStudyInactive;
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={disabled}
        ///       />
        ///
        ///       <button
        ///         onClick={(event) => {
        ///           event.preventDefault();
        ///           event.stopPropagation();
        ///
        ///           if (!enabled) {
        ///             console.warn('Missing required state', {
        ///               isConnected,
        ///               assertsClient,
        ///               assertsBlockchain,
        ///             });
        ///             return;
        ///           }
        ///
        ///           setIsFetching(true);
        ///           writeContractAsync({
        ///             address: addressStudy,
        ///             abi: zorpStudyAbi,
        ///             functionName: 'startStudy',
        ///             args: [],
        ///           }).then((response) => {
        ///             if (!!response) {
        ///               setReceipt(response);
        ///             } else {
        ///               setReceipt(`...  error with receipt response -> ${response}`);
        ///             }
        ///           }).catch((error) => {
        ///             console.error(error);
        ///             setReceipt(`...  error with writeContractAsync error -> ${error}`);
        ///           }).finally(() => {
        ///             setIsFetching(false);
        ///           });
        ///         }}
        ///         disabled={disabled}
        ///       >Start {enabled ? 'Available' : 'unavailable'}</button>
        ///
        ///       <span>ZorpStudy start receipt: {receipt}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function startStudy() external payable;

        /// @notice Set `STUDY_STATUS__FINISHED` in `ZorpStudy.study_status`
        ///
        /// @custom:throws `InvalidStudyState(uint256 current_state, uint256 required_state)`
        /// @custom:throws `RemainderTransferFailed(address to, uint256 amount, uint256 balance)`
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
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useAccount, useReadContract, useWriteContract } from 'wagmi';
        /// import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';
        ///
        /// export default function ZorpStudyWriteEndStudy() {
        ///   const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        ///   const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
        ///   const [isFetching, setIsFetching] = useState<boolean>(false);
        ///   const [receipt, setReceipt] = useState<string>('... pending');
        ///
        ///   const addressStudyId = useId();
        ///
        ///   const { address, isConnected } = useAccount();
        ///   const { writeContractAsync } = useWriteContract();
        ///
        ///   const assertsClient = {
        ///     isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
        ///     isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
        ///   };
        ///
        ///   const { data: owner, isFetching: isFetchingOwner } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'owner',
        ///     args: [],
        ///     query: {
        ///       enabled: assertsClient.isAddressStudySet,
        ///     },
        ///   });
        ///
        ///   const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
        ///     address: addressStudy,
        ///     abi: zorpStudyAbi,
        ///     functionName: 'study_status',
        ///     args: [],
        ///     query: {
        ///       enabled: assertsClient.isAddressStudySet,
        ///     },
        ///   });
        ///
        ///   const assertsBlockchain = {
        ///     isAddressOwnerSet: !!(owner as `0x${string}`)
        ///                     && (owner as `0x${string}`).length === addressStudyAnvil.length
        ///                     && (owner as `0x${string}`).startsWith('0x'),
        ///     isStudyOwner: address == owner,
        ///     isStudyActive: study_status == 1,
        ///   };
        ///
        ///   const disabled = isFetching
        ///                 || isFetchingOwner
        ///                 || isFetchingStudyStatus
        ///                 || !isConnected;
        ///
        ///   const enabled = isConnected
        ///                 && assertsClient.isAddressStudySet
        ///                 && assertsClient.isAddressWalletSet
        ///                 && assertsBlockchain.isAddressOwnerSet
        ///                 && assertsBlockchain.isStudyOwner
        ///                 && assertsBlockchain.isStudyActive;
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressStudyId}>ZORP Study Address:</label>
        ///       <input
        ///         id={addressStudyId}
        ///         value={addressStudy}
        ///         onChange={(event) => {
        ///           setAddressStudy(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={disabled}
        ///       />
        ///
        ///       <button
        ///         onClick={(event) => {
        ///           event.preventDefault();
        ///           event.stopPropagation();
        ///
        ///           if (!enabled) {
        ///             console.warn('Missing required state', {
        ///               isConnected,
        ///               assertsClient,
        ///               assertsBlockchain,
        ///             });
        ///             return;
        ///           }
        ///
        ///           setIsFetching(true);
        ///           writeContractAsync({
        ///             address: addressStudy,
        ///             abi: zorpStudyAbi,
        ///             functionName: 'endStudy',
        ///             args: [],
        ///           }).then((response) => {
        ///             if (!!response) {
        ///               setReceipt(response);
        ///             } else {
        ///               setReceipt(`...  error with receipt response -> ${response}`);
        ///             }
        ///           }).catch((error) => {
        ///             console.error(error);
        ///             setReceipt(`...  error with writeContractAsync error -> ${error}`);
        ///           }).finally(() => {
        ///             setIsFetching(false);
        ///           });
        ///         }}
        ///         disabled={disabled}
        ///       >End {enabled ? 'Available' : 'unavailable'}</button>
        ///
        ///       <span>ZorpStudy end receipt: {receipt}</span>
        ///     </>
        ///   );
        /// }
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
