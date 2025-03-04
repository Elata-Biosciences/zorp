'use client';

import { useId, useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';

export default function ZorpFactoryWriteWithdraw() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [addressTo, setAddressTo] = useState<`0x${string}` | undefined>(undefined);
	const [ammount, setAmmount] = useState<number>(0);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');
	const addressFactoryId = useId();
	const addressToId = useId();
	const ammountId = useId();
	const { isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	return (
		<>
			<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={(event) => {
					setAddressFactory(event.target.value as `0x${string}`);
				}}
				disabled={isFetching}
			/>

			<label htmlFor={addressToId}>ZORP Factory withdraw address:</label>
			<input
				id={addressToId}
				value={addressTo as `0x${string}`}
				onChange={(event) => {
					setAddressTo(event.target.value as `0x${string}`);
				}}
				disabled={isFetching}
			/>

			<label htmlFor={ammountId}>ZORP Factory withdraw amount:</label>
			<input
				id={ammountId}
				value={ammount}
				onChange={(event) => {
					const value = Number.parseInt(event.target.value);
					if (Number.isNaN(value) || value < 1) {
						console.error('Input value was not an intager greater than 1');
						return;
					}
					setAmmount(value);
				}}
				disabled={isFetching}
			/>

			<button
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();

					const enabled = isConnected
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x')
												&& !!addressTo
												&& addressTo.length === addressFactoryAnvil.length
												&& addressTo.startsWith('0x')
												&& !Number.isNaN(ammount)
												&& ammount > 0;

					if (!enabled) {
						console.warn('Missing required state', { addressFactory, addressTo, ammount });
						return;
					}

					setIsFetching(true);
					writeContractAsync({
						address: addressFactory,
						abi: zorpFactoryAbi,
						functionName: 'withdraw',
						args: [addressTo, ammount],
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
			>Withdraw</button>

			<span>ZorpFactory withdraw receipt: {receipt}</span>
		</>
	);
}

