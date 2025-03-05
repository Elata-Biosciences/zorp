'use client';

import { useId, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';

export default function ZorpStudyWriteEndStudy() {
	const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const addressStudyId = useId();

	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const assertsClient = {
		isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
		isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
	};

	const { data: owner, isFetching: isFetchingOwner } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'owner',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet,
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet,
		},
	});

	const assertsBlockchain = {
		isAddressOwnerSet: !!(owner as `0x${string}`)
										&& (owner as `0x${string}`).length === addressStudyAnvil.length
										&& (owner as `0x${string}`).startsWith('0x'),
		isStudyOwner: address == owner,
		isStudyActive: study_status == 1,
	};

	const disabled = isFetching
								|| isFetchingOwner
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& assertsClient.isAddressStudySet
								&& assertsClient.isAddressWalletSet
								&& assertsBlockchain.isAddressOwnerSet
								&& assertsBlockchain.isStudyOwner
								&& assertsBlockchain.isStudyActive;

	return (
		<>
			<label htmlFor={addressStudyId}>ZORP Study Address:</label>
			<input
				id={addressStudyId}
				value={addressStudy}
				onChange={(event) => {
					setAddressStudy(event.target.value as `0x${string}`);
				}}
				disabled={disabled}
			/>

			<button
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();

					if (!enabled) {
						console.warn('Missing required state', {
							isConnected,
							assertsClient,
							assertsBlockchain,
						});
						return;
					}

					setIsFetching(true);
					writeContractAsync({
						address: addressStudy,
						abi: zorpStudyAbi,
						functionName: 'endStudy',
						args: [],
					}).then((response) => {
						if (!!response) {
							setReceipt(response);
						} else {
							setReceipt(`...  error with receipt response -> ${response}`);
						}
					}).catch((error) => {
						console.error(error);
						setReceipt(`...  error with writeContractAsync error -> ${error}`);
					}).finally(() => {
						setIsFetching(false);
					});
				}}
				disabled={disabled}
			>End {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy end receipt: {receipt}</span>
		</>
	);
}
