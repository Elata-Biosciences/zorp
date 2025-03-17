'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyWriteClaimReward() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const { IZorpStudy } = useContracts();
	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const assertsClient = useMemo(() => {
		return {
			isAddressParticipantSet: address?.length === addressStudyAnvil.length && address.startsWith('0x'),
			isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
			isContractStudySet: !!IZorpStudy?.abi && !!Object.keys(IZorpStudy.abi).length && !!IZorpStudy?.address.length,
		};
	}, [
		IZorpStudy,
		address,
		addressStudy,
		addressStudyAnvil,
	]);

	const { data: participant_status, isFetching: isFetchingParticipantStatus } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'participant_status',
		args: [address],
		query: {
			enabled: isConnected
						&& assertsClient.isAddressParticipantSet
						&& assertsClient.isAddressStudySet
						&& assertsClient.isContractStudySet
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const assertsBlockchain = useMemo(() => {
		return {
			isParticipantSubmitted: participant_status == 1,
			isStudyFinised: study_status == 2,
		};
	}, [
		participant_status,
		study_status,
	]);

	const disabled = isFetching
								|| isFetchingParticipantStatus 
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& assertsClient.isAddressParticipantSet
								&& assertsClient.isAddressStudySet
								&& assertsClient.isContractStudySet
								&& assertsBlockchain.isParticipantSubmitted
								&& assertsBlockchain.isStudyFinised;

	const handleZorpStudyWriteClaimReward = useCallback(async () => {
		if (!enabled) {
			console.warn('Missing required state', { assertsClient, assertsBlockchain });
			return;
		}

		setIsFetching(true);

		try {
			const response = await writeContractAsync({
				abi: IZorpStudy.abi,
				address: IZorpStudy.address,
				functionName: 'claimReward',
				args: [],
			});

			if (!!response) {
				setReceipt(response);
			} else {
				setReceipt(`...  error with receipt response -> ${response}`);
			}
		} catch (error) {
			let message = 'Error: ';
			if (!!error && typeof error == 'object') {
				if ('message' in error) {
					message += error.message;
				} else if ('toString' in error) {
					message += error.toString();
				} else {
					message += `Novel error detected -> ${error}`;
				}
			} else {
				message += `Novel error detected -> ${error}`;
			}

			console.error('ZorpStudyWriteClaimReward ...', { message, error });
			setReceipt(message);
			return error;
		} finally {
			setIsFetching(false);
		}
	}, [
		IZorpStudy,
		assertsBlockchain,
		assertsClient,
		enabled,
		setIsFetching,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Claim reward
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<button
				onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await handleZorpStudyWriteClaimReward();
				}}
				disabled={disabled}
			>Claim Reward {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy claim reward receipt: {receipt}</span>
		</div>
	);
}
