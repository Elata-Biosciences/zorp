'use client';

import { useId, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';

export default function ZorpStudyWriteClaimReward() {
	const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const addressStudyId = useId();

	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const { data: participant_status, isFetching: isFetchingParticipantStatus } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'participant_status',
		args: [address],
		query: {
			enabled: isConnected
						&& addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x'),
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x'),
		},
	});

	const disabled = isFetching
								|| isFetchingParticipantStatus 
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& addressStudy.length === addressStudyAnvil.length
								&& addressStudy.startsWith('0x')
								&& !!address
								&& address.length === addressStudyAnvil.length
								&& address.startsWith('0x')
								&& participant_status == 1
								&& study_status == 2;

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
						console.warn('Missing required state', { addressStudy, address, participant_status, study_status });
						return;
					}

					setIsFetching(true);
					writeContractAsync({
						address: addressStudy,
						abi: zorpStudyAbi,
						functionName: 'claimReward',
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
			>Claim Reward {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy claim reward receipt: {receipt}</span>
		</>
	);
}
