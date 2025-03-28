// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IOwnable } from "./IOwnable.sol";

error FactoryUpdatedAlready(address ref_current, address ref_new);
error WithdrawFailed(address to, uint256 amount, uint256 balance);

event FactoryUpdated(address ref_current, address indexed ref_new);
event StudyCreated(address indexed studyAddress);

/// @title Publicly accessible stored states within `ZorpFactory`
interface IZorpFactory_Storage {
    /* Constants {{{ */
        /// @notice Each new instance of `ZorpFactory` should increment this value prior to publishing
        /// @return Get version of this factory instance
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        /// uint256 version = IZorpFactory(factory).VERSION();
        /// ```
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'VERSION()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryReadVersion() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const addressFactoryId = useId();
        ///
        ///   const { data: version, isFetching } = useReadContract({
        ///     address: addressFactory,
        ///     abi: zorpFactoryAbi,
        ///     functionName: 'VERSION',
        ///     args: [],
        ///     query: {
        ///       enabled: addressFactory.length === addressFactoryAnvil.length
        ///             && addressFactory.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///       <span>ZorpFactory version: {version as string}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function VERSION() external view returns (uint256);

        /// @notice Placeholder for when future revision of `ZorpFactory` points to an instance it should supersede
        /// @return Get contract address to previous ZorpFactory instance
        /// @dev see `IZorpFactory_Storage.ref_factory_next()` provides one-half of doubly linked-list functionality
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        /// address previous_factory = IZorpFactory(factory).ref_factory_previous();
        /// ```
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'ref_factory_previous()(address)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryReadRefFactoryPrevious() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const addressFactoryId = useId();
        ///
        ///   const { data: ref_factory_previous, isFetching } = useReadContract({
        ///     address: addressFactory,
        ///     abi: zorpFactoryAbi,
        ///     functionName: 'ref_factory_previous',
        ///     args: [],
        ///     query: {
        ///       enabled: addressFactory.length === addressFactoryAnvil.length
        ///             && addressFactory.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///       <span>ZorpFactory previous address: {ref_factory_previous as string}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function ref_factory_previous() external view returns (address);
    /* Constants }}} */

    /* Immutable {{{ */
        /// @notice When future revision of `ZorpFactory` is published this function will provide a pointer to that contract's address
        /// @return Get contract address to next ZorpFactory instance
        /// @dev see `IZorpFactory_Storage.ref_factory_previous()` provides one-half of doubly linked-list functionality
        /// @dev see `IZorpFactory_Functions.setRefFactoryNext(address)`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        /// address ref_next_factory = IZorpFactory(factory).ref_factory_next();
        /// require(ref_next_factory != address(0), "There is a new ZorpFactory instance available");
        /// ```
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'ref_factory_next()(address)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryReadRefFactoryNext() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const addressFactoryId = useId();
        ///
        ///   const { data: ref_factory_next, isFetching } = useReadContract({
        ///     address: addressFactory,
        ///     abi: zorpFactoryAbi,
        ///     functionName: 'ref_factory_next',
        ///     args: [],
        ///     query: {
        ///       enabled: addressFactory.length === addressFactoryAnvil.length
        ///             && addressFactory.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///       <span>ZorpFactory next address: {ref_factory_next as string}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function ref_factory_next() external view returns (address);
    /* Immutable }}} */

    /* Mutable {{{ */
        /// @notice Warning, treating this as equivalent to `Array.length()` may lead to off-by-one errors!
        /// @return Get upper bound/index for `.studies(uint256)` mapping
        /// @dev Note when zero (`0`) is returned, then no `ZorpStudy` contracts have been created with this factory instance
        /// @dev see `IZorpFactory_Storage.studies(uint256)`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        /// uint256 last_index = IZorpFactory(factory).latest_study_index();
        /// require(last_index > 0, "No studies have been created with this ZorpFactory instance");
        /// ```
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'latest_study_index()(uint256)';
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryReadLatestStudyIndex() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const addressFactoryId = useId();
        ///
        ///   const { data: latest_study_index, isFetching } = useReadContract({
        ///     address: addressFactory,
        ///     abi: zorpFactoryAbi,
        ///     functionName: 'latest_study_index',
        ///     args: [],
        ///     query: {
        ///       enabled: addressFactory.length === addressFactoryAnvil.length
        ///             && addressFactory.startsWith('0x'),
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///       <span>ZorpFactory latest study index: {latest_study_index as string}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function latest_study_index() external view returns (uint256);

        /// @notice Mapping of `ZorpStudy` contract addresses that this factory has created
        /// @param index Key into mapping from which to lookup a `ZorpStudy` contract address
        /// @return Address to `ZorpStudy` or `address(0)` when no contract is tracked for given `index`
        /// @dev see `IZorpFactory_Storage.latest_study_index()`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        /// uint256 last_index = IZorpFactory(factory).latest_study_index();
        /// address ref_last_study = IZorpFactory(factory).studies(last_index);
        /// ```
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        /// zorp_factory_study_index="41";
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'studies(uint256)(address)' \
        ///         "${zorp_factory_study_index}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryReadStudyAddress() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const [studyIndex, setStudyIndex] = useState<number>(1);
        ///   const addressFactoryId = useId();
        ///   const addressFactoryStudyIndexId = useId();
        ///
        ///   const { data: studyAddress, isFetching } = useReadContract({
        ///     address: addressFactory,
        ///     abi: zorpFactoryAbi,
        ///     functionName: 'studies',
        ///     args: [studyIndex],
        ///     query: {
        ///       enabled: addressFactory.length === addressFactoryAnvil.length
        ///             && addressFactory.startsWith('0x')
        ///             && !Number.isNaN(studyIndex)
        ///             && studyIndex > 0,
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={addressFactoryStudyIndexId}>ZORP Study index:</label>
        ///       <input
        ///         id={addressFactoryStudyIndexId}
        ///         value={studyIndex}
        ///         onChange={(event) => {
        ///           const value = Number.parseInt(event.target.value);
        ///           if (Number.isNaN(value) || value < 1) {
        ///             console.error('Input value was not an intager greater than 1');
        ///             return;
        ///           }
        ///           setStudyIndex(value);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <span>ZorpFactory study address: {studyAddress as `0x${string}`}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function studies(uint256 index) external view returns (address);
    /* Mutable }}} */
}

/// @title Executable logic for `ZorpFactory`
interface IZorpFactory_Functions {
    /* Public {{{ */
        /// @notice Deploy a new `ZorpStudy` contract and return its address
        /// @param initialOwner Address of owner for study, I.E. the account allowed to execute functions like; `.flagInvalidSubmission(address)`, `.startStudy()`, and `.endStudy()`
        /// @param encryptionKey pointer to public GPG/PGP key
        /// @return Address of new `ZorpStudy` contract
        ///
        /// @custom:throws `InvalidMessageValue(uint256 value, uint256 minimum)`
        ///
        /// @dev see `./IZorpStudy.sol`
        /// @dev see `./ZorpStudy.sol` → `constructor`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// import { IZorpFactory } from "<NAME_SPACE>/src/IZorpFactory.sol";
        ///
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        ///
        /// address payable initialOwner = "<YOUR_PUBLIC_WALLET_ADDRESS>";
        /// string memory encryptionKey = "<CID_TO_YOUR_PUBLIC_PGP_KEY>";
        ///
        /// address newStudy = IZorpFactory(factory).createStudy{value: 1 ether}(initialOwner, encryptionKey);
        /// /* ... Make use of `IZorpStudy(newStudy)` features ... */
        /// ```
        function createStudy(address payable initialOwner, string memory encryptionKey) external payable returns (address);
    /* Public }}} */

    /* Owner {{{ */
        /// @notice Restricted to `IZorpFactory.owner()` and may be written to **only** once
        /// @param ref Address of new `ZorpFactory` instance that may contain more features, bug fixes, etc.
        ///
        /// @custom:throws `FactoryUpdatedAlready(address ref_current, address ref_new)`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        ///
        /// address payable ref = <ADDRESS_TO_NEW_FACTORY_CONTRACT>;
        ///
        /// IZorpFactory(factory).setRefFactoryNext(ref);
        /// ```
        function setRefFactoryNext(address ref) external payable;

        /// @notice Restricted to `IZorpFactory.owner()` allows for withdrawing funds from contract
        /// @param to Address that should be paid from this contract with the native currency used by Blockchain
        /// @param amount Native currency for Blockchain to transfer from this contract to recipient
        ///
        /// @custom:throws `WithdrawFailed(address to, uint256 amount, uint256 balance)`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        ///
        /// address payable to = <ADDRESS_TO_PAY>;
        /// uint256 amount = 1 ether;
        ///
        /// IZorpFactory(factory).withdraw(to, amount);
        /// ```
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        /// zorp_factory_to="0xd6c12888363B422e72647FB95c97fE007C8a7870";
        /// zorp_factory_amount="1";
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'withdraw(uint256)(address)' \
        ///         "${zorp_factory_study_index}" \
        ///         "${zorp_factory_study_index}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useAccount, useWriteContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryWriteWithdraw() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const [addressTo, setAddressTo] = useState<`0x${string}` | undefined>(undefined);
        ///   const [amount, setAmount] = useState<number>(0);
        ///   const [isFetching, setIsFetching] = useState<boolean>(false);
        ///   const [receipt, setReceipt] = useState<string>('... pending');
        ///   const addressFactoryId = useId();
        ///   const addressToId = useId();
        ///   const amountId = useId();
        ///   const { isConnected } = useAccount();
        ///   const { writeContractAsync } = useWriteContract();
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={addressToId}>ZORP Factory withdraw address:</label>
        ///       <input
        ///         id={addressToId}
        ///         value={addressTo as `0x${string}`}
        ///         onChange={(event) => {
        ///           setAddressTo(event.target.value as `0x${string}`);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={amountId}>ZORP Factory withdraw amount:</label>
        ///       <input
        ///         id={amountId}
        ///         value={amount}
        ///         onChange={(event) => {
        ///           const value = Number.parseInt(event.target.value);
        ///           if (Number.isNaN(value) || value < 1) {
        ///             console.error('Input value was not an intager greater than 1');
        ///             return;
        ///           }
        ///           setAmount(value);
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <button
        ///         onClick={(event) => {
        ///           event.preventDefault();
        ///           event.stopPropagation();
        ///
        ///           const enabled = isConnected
        ///                         && addressFactory.length === addressFactoryAnvil.length
        ///                         && addressFactory.startsWith('0x')
        ///                         && !!addressTo
        ///                         && addressTo.length === addressFactoryAnvil.length
        ///                         && addressTo.startsWith('0x')
        ///                         && !Number.isNaN(amount)
        ///                         && amount > 0;
        ///
        ///           if (!enabled) {
        ///             console.warn('Missing required state', { addressFactory, addressTo, amount });
        ///             return;
        ///           }
        ///
        ///           setIsFetching(true);
        ///           writeContractAsync({
        ///             address: addressFactory,
        ///             abi: zorpFactoryAbi,
        ///             functionName: 'withdraw',
        ///             args: [addressTo, amount],
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
        ///       >Withdraw</button>
        ///
        ///       <span>ZorpFactory withdraw receipt: {receipt}</span>
        ///     </>
        ///   );
        /// }
        /// ```
        function withdraw(address payable to, uint256 amount) external payable;
    /* Owner }}} */

    /* Viewable {{{ */
        /// @notice Return a possibly sparse array of CID strings pointing to submitted data
        /// @param study Address of `ZorpStudy` contract
        /// @param start Index within `ZorpStudy.submitted_data` mapping to start paginating data
        /// @param limit Number of entries to return in paginated data
        /// @return Array of IPFS CIDs pointing to submitted data
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        /// zorp_study_address="0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";
        /// zorp_study_start=68;
        /// zorp_study_limit=419;
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'paginateSubmittedData(address,uint256,uint256)(string[])' \
        ///         "${zorp_study_address}" \
        ///         "${zorp_study_start}" \
        ///         "${zorp_study_limit}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see: f915d9b:zorp-frontend/src/app/zorp/factory/paginate-submitted-data/page.tsx */
        /// ```
        function paginateSubmittedData(address study, uint256 start, uint256 limit) external view returns (string[] memory);

        /// @notice Return a possibly sparse array of participant statuses
        /// @param study Address of `ZorpStudy` contract
        /// @param start Index within `ZorpStudy.participant_status` mapping to start paginating data
        /// @param limit Number of entries to return in paginated data
        /// @return Array of participant status values
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        /// zorp_study_address="0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";
        /// zorp_study_start=1336;
        /// zorp_study_limit=41;
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'paginateParticipantStatus(address,uint256,uint256)(uint256[])' \
        ///         "${zorp_study_address}" \
        ///         "${zorp_study_start}" \
        ///         "${zorp_study_limit}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// /* see: f915d9b:zorp-frontend/src/app/zorp/factory/paginate-participant-status/page.tsx */
        /// ```
        function paginateParticipantStatus(address study, uint256 start, uint256 limit) external view returns (uint256[] memory);

        /// @notice Intended for off-chain requests for bulk lookup of `ZorpStudy` contract addresses this instance of `ZorpFactory` tracks
        /// @param start Index/key to start getting data from `.studies` mapping
        /// @param limit Total number of entries to retrieve from `.studies` mapping
        /// @return Array of `ZorpFactory` address
        ///
        /// ## Off-chain example with cast
        ///
        /// ```bash
        /// zorp_factory_address="0x5FbDB2315678afecb367f032d93F642f64180aa3";
        /// zorp_factory_start=68;
        /// zorp_factory_limit=419;
        ///
        /// cast call "${zorp_factory_address}" \
        ///     --rpc-url 127.0.0.1:8545 \
        ///     'paginateStudies(uint256,uint256)(address[])' \
        ///         "${zorp_factory_start}" \
        ///         "${zorp_factory_limit}";
        /// ```
        ///
        /// ## Off-chain example with wagmi
        ///
        /// ```tsx
        /// 'use client';
        ///
        /// import { useId, useState } from 'react';
        /// import { useReadContract } from 'wagmi';
        /// import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';
        ///
        /// export default function ZorpFactoryReadPaginateSubmittedData() {
        ///   const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        ///   const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
        ///   const [start, setStart] = useState<number>(1);
        ///   const [limit, setLimit] = useState<number>(10);
        ///
        ///   const addressFactoryId = useId();
        ///   const addressStudyId = useId();
        ///   const startId = useId();
        ///   const limitId = useId();
        ///
        ///   const { data: studyAddresses, isFetching, refetch } = useReadContract({
        ///     address: addressFactory,
        ///     abi: zorpFactoryAbi,
        ///     functionName: 'paginateStudies',
        ///     args: [start, limit],
        ///     query: {
        ///       enabled: false,
        ///     },
        ///   });
        ///
        ///   return (
        ///     <>
        ///       <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
        ///       <input
        ///         id={addressFactoryId}
        ///         value={addressFactory}
        ///         onChange={(event) => {
        ///           setAddressFactory(event.target.value as `0x${string}`);
        ///         }}
        ///       />
        ///
        ///       <label htmlFor={startId}>Start</label>
        ///       <input
        ///         id={startId}
        ///         type="number"
        ///         min="1"
        ///         value={start}
        ///         onChange={(event) => {
        ///           const value = Number.parseInt(event.target.value);
        ///           if (!isNaN(value)) {
        ///             setStart(value);
        ///           }
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <label htmlFor={limitId}>Limit</label>
        ///       <input
        ///         id={limitId}
        ///         type="number"
        ///         min="1"
        ///         value={limit}
        ///         onChange={(event) => {
        ///           const value = Number.parseInt(event.target.value);
        ///           if (!isNaN(value)) {
        ///             setLimit(value);
        ///           }
        ///         }}
        ///         disabled={isFetching}
        ///       />
        ///
        ///       <button
        ///         onClick={(event) => {
        ///           event.preventDefault();
        ///           event.stopPropagation();
        ///
        ///           const enabled = !isFetching
        ///                         && addressFactory.length === addressFactoryAnvil.length
        ///                         && addressFactory.startsWith('0x');
        ///
        ///           if (!enabled) {
        ///             console.warn('Missing required input(s) ->', {
        ///               addressFactory,
        ///               start,
        ///               limit,
        ///             });
        ///             return;
        ///           }
        ///
        ///           refetch();
        ///         }}
        ///         disabled={isFetching}
        ///       >Get Study Addresses</button>
        ///
        ///       <section>
        ///         <header>Study addresses</header>
        ///         <ul>
        ///           { (studyAddresses as `0x${string}`[])?.map((address, i) => {
        ///             return <li key={`${i}-${address}`}>{address}</li>;
        ///           }) }
        ///         </ul>
        ///       </section>
        ///     </>
        ///   );
        /// }
        /// ```
        function paginateStudies(uint256 start, uint256 limit) external view returns (address[] memory);
    /* Viewable }}} */
}

/// @title Organize any inherited contracts that also contain publicly accessible functions/storage
interface IZorpFactory_Inherited is IOwnable {}

/// @title On/Off chain consumers of `ZorpStudy` may wish to use this interface
/// @author wkyleg
/// @author S0AndS0
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
///
/// ## On-chain example
///
/// ```solidity
/// import { IZorpFactory } from "<NAME_SPACE>/src/IZorpFactory.sol";
///
/// contract View_ZorpFactory {
///     getStudy(
///         address factory,
///         uint256 index
///     ) external view returns (address) {
///         return IZorpFactory(factory).studies(participant);
///     }
/// }
/// ```
///
/// @custom:file ./ZorpFactory.sol
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
interface IZorpFactory is IZorpFactory_Storage, IZorpFactory_Functions, IZorpFactory_Inherited {}
