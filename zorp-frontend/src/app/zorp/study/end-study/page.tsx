'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyWriteEndStudy() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const { contracts } = useContracts();
	const IZorpStudy = contracts?.IZorpStudy;
	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const assertsClient = useMemo(() => {
		return {
			isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
			isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
			isContractStudySet: !!IZorpStudy?.abi && !!Object.keys(IZorpStudy?.abi || []).length && !!addressStudy.length,
		};
	}, [
		IZorpStudy,
		address,
		addressStudy,
		addressStudyAnvil,
	])

	const { data: owner, isFetching: isFetchingOwner } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'owner',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
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

	const assertsBlockchain = useMemo(() => {
		return {
			isAddressOwnerSet: !!(owner as `0x${string}`)
			&& (owner as `0x${string}`).length === addressStudyAnvil.length
			&& (owner as `0x${string}`).startsWith('0x'),
			isStudyOwner: address == owner,
			isStudyActive: study_status == 1,
		};
	}, [
		owner,
		addressStudyAnvil,
		address,
		study_status,
	]);

	const disabled = isFetching
								|| isFetchingOwner
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& assertsClient.isAddressStudySet
								&& assertsClient.isAddressWalletSet
								&& assertsBlockchain.isAddressOwnerSet
								&& assertsBlockchain.isStudyOwner
								&& assertsBlockchain.isStudyActive
								&& assertsClient.isContractStudySet;

	const handleOnClick = useCallback(async () => {
		if (!enabled) {
			console.warn('Missing required state', {
				isConnected,
				assertsClient,
				assertsBlockchain,
			});
			return;
		}

		setIsFetching(true);

		try {
			const response = await writeContractAsync({
				abi: IZorpStudy?.abi || [],
				address: addressStudy,
				functionName: 'endStudy',
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

			console.error('ZorpStudyWriteEndStudy ->', { message, error });
			setReceipt(message);
			return error;
		} finally {
			setIsFetching(false);
		}
	}, [
		IZorpStudy,
		addressStudy,
		assertsBlockchain,
		assertsClient,
		enabled,
		isConnected,
		setIsFetching,
		setReceipt,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- End study
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
					await handleOnClick();
				}}
				disabled={disabled}
			>End {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy end receipt: {receipt}</span>
		</div>
	);
}
