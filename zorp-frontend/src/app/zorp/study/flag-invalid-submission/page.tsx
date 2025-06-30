'use client';

import { useCallback, useId, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyWriteFlagInvalidSubmission() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const addressParticipantId = useId();

	const { contracts } = useContracts();
	const IZorpStudy = contracts?.IZorpStudy;
	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const assertsClient = {
		isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
		isAddressParticipantSet: addressParticipant.length === addressStudyAnvil.length && addressParticipant.startsWith('0x'),
		isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
		isContractStudySet: !!IZorpStudy?.abi && !!Object.keys(IZorpStudy?.abi || []).length && !!addressStudy.length,
	};

	const { data: owner, isFetching: isFetchingOwner } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'owner',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const { data: participant_status, isFetching: isFetchingParticipantStatus } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'participant_status',
		args: [addressParticipant],
		query: {
			enabled: isConnected
						&& assertsClient.isAddressStudySet
						&& assertsClient.isAddressParticipantSet
						&& assertsClient.isContractStudySet,
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const assertsBlockchain = {
		isAddressOwnerSet: !!(owner as `0x${string}`)
										&& (owner as `0x${string}`).length === addressStudyAnvil.length
										&& (owner as `0x${string}`).startsWith('0x'),
		isStudyOwner: address == owner,
		isParticipantSubmitted: participant_status == 1,
		isStudyActive: study_status == 2,
	};

	const disabled = isFetching
								|| isFetchingOwner
								|| isFetchingParticipantStatus 
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& assertsClient.isAddressStudySet
								&& assertsClient.isAddressParticipantSet
								&& assertsClient.isAddressWalletSet
								&& assertsBlockchain.isAddressOwnerSet
								&& assertsBlockchain.isStudyOwner
								&& assertsBlockchain.isParticipantSubmitted
								&& assertsBlockchain.isStudyActive;

	const handleChangeParticipantAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressParticipant(event.target.value as `0x${string}`);
	}, [ setAddressParticipant ]);

	const handleOnClick = useCallback(async () => {
		if (!enabled) {
			return;
		}

		setIsFetching(true);

		try {
			const response = await writeContractAsync({
				abi: IZorpStudy?.abi || [],
				address: addressStudy,
				functionName: 'flagInvalidSubmission',
				args: [addressParticipant],
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

			console.error('ZorpStudyWriteFlagInvalidSubmission ->', { message, error });
			setReceipt(message);
			return error;
		} finally {
			setIsFetching(false);
		}
	}, [
		enabled,
		setIsFetching,
		IZorpStudy,
		addressParticipant,
		addressStudy,
		setReceipt,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Flag invalid submission
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<label htmlFor={addressParticipantId}>ZORP Participant Address:</label>
			<input
				id={addressParticipantId}
				value={addressParticipant}
				onChange={handleChangeParticipantAddress}
				disabled={disabled}
			/>

			<button
				onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await handleOnClick();
				}}
				disabled={disabled}
			>Flag Submission {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy flag invalid submission receipt: {receipt}</span>
		</div>
	);
}
