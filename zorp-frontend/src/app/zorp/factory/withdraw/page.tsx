'use client';

import { useCallback, useId, useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryWriteWithdraw() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [addressTo, setAddressTo] = useState<`0x${string}` | undefined>(undefined);
	const [amount, setAmount] = useState<number>(0);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const addressFactoryId = useId();
	const addressToId = useId();
	const amountId = useId();

	const { isConnected } = useAccount();

	const { writeContractAsync } = useWriteContract();

	const { IZorpFactory } = useContracts();

	const handleChangeFactoryAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressFactory(event.target.value as `0x${string}`);
	}, [ setAddressFactory ]);

	const handleChangeAddressTo = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressTo(event.target.value as `0x${string}`);
	}, [ setAddressTo ]);

	const handleChangeAmount = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (Number.isNaN(value) || value < 1) {
			console.error('Input value was not an intager greater than 1');
			return;
		}
		setAmount(value);
	}, [ setAmount ]);

	const handleZorpFactoryWriteWithdraw = useCallback(async () => {
		const enabled: boolean = isConnected
													&& !isFetching
													&& !!IZorpFactory?.abi
													&& !!Object.keys(IZorpFactory.abi).length
													&& !!IZorpFactory?.address.length
													&& addressFactory.length === addressFactoryAnvil.length
													&& addressFactory.startsWith('0x')
													&& !!addressTo
													&& addressTo.length === addressFactoryAnvil.length
													&& addressTo.startsWith('0x')
													&& !Number.isNaN(amount)
													&& amount > 0;

		if (!enabled) {
			console.warn('Missing required state', { addressFactory, addressTo, amount });
			return;
		}

		setIsFetching(true);

		try {
			const response = await writeContractAsync({
				abi: IZorpFactory.abi,
				address: IZorpFactory.address,
				functionName: 'withdraw',
				args: [addressTo, amount],
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

			console.error('ZorpFactoryWriteWithdraw ...', { message, error });
			setReceipt(message);
			return error;
		} finally {
			setIsFetching(false);
		}
	}, [
		IZorpFactory,
		addressFactory,
		addressFactoryAnvil,
		addressTo,
		amount,
		isConnected,
		isFetching,
		setIsFetching,
		setReceipt,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Withdraw
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={handleChangeFactoryAddress}
				disabled={isFetching}
			/>

			<label htmlFor={addressToId}>ZORP Factory withdraw address:</label>
			<input
				id={addressToId}
				value={addressTo as `0x${string}`}
				onChange={handleChangeAddressTo}
				disabled={isFetching}
			/>

			<label htmlFor={amountId}>ZORP Factory withdraw amount:</label>
			<input
				id={amountId}
				value={amount}
				onChange={handleChangeAmount}
				disabled={isFetching}
			/>

			<button
				onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await handleZorpFactoryWriteWithdraw();
				}}
			>Withdraw</button>

			<span>ZorpFactory withdraw receipt: {receipt}</span>
		</div>
	);
}

