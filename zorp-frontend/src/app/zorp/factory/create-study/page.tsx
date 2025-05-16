'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import { useAccount, useWriteContract, useTransactionReceipt } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import GpgEncryptionKeyFromInputFile from '@/components/features/GpgEncryptionKeyFromInputFile';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

/**
 * @see {@link https://wagmi.sh/react/api/hooks/useTransactionReceipt}
 */
export default function ZorpFactoryWriteCreateStudy() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;
	const className = '';

	// TODO: consider reducing need of keeping bot `Key` and `File` in memory at same time
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);
	const [hash, setHash] = useState<undefined | `0x${string}`>(undefined);
	const [irysBalance, setIrysBalance] = useState<null | bigint | number | BigNumber>(null);
	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const [amount, setAmount] = useState<null | bigint>(null);

	const { writeContractAsync, isPending } = useWriteContract({
		config: config.wagmiConfig,
	});

	const { address, isConnected } = useAccount();
	const { IZorpFactory } = useContracts();

	const handleZorpFactoryCreateStudyAmount = useCallback((amount: bigint) => {
		if (!amount || amount < 1) {
			setMessage('Waiting for positive study deposit amount');
			setAmount(null);
			return;
		}

		setAmount(amount);
	}, []);

	const handleZorpFactoryWriteCreateStudy = useCallback(() => {
		if (!isConnected) {
			const message = 'Warn: waiting on client to connect an account';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (!address?.toString().length) {
			const message = 'Warn: waiting on client to connect an account with an address';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (!amount || amount < 1) {
			setMessage('Waiting for positive study deposit amount');
			setAmount(null);
			return;
		}

		// if (!irysUploadData || !irysUploadData.cid || !irysUploadData.receipt) {
		if (!irysUploadData || !irysUploadData.cid) {
			const message = 'Warn: for Irys upload to report success';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (
			!IZorpFactory
			|| !IZorpFactory?.abi
			|| !Object.keys(IZorpFactory?.abi).length
			|| !IZorpFactory?.address.length
		) {
			const message = 'Error: cannot find IZorpFactory for current chain';
			console.error('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		setMessage('Warn: starting blockchain write request to `ZorpFactory.createStudy`')
		writeContractAsync({
			abi: IZorpFactory.abi,
			address: addressFactory,
			functionName: 'createStudy',
			args: [
				address.toString(),
				irysUploadData.cid.toString(),
			],
			value: amount,
		}).then((hash) => {
			setHash(hash);
			setMessage('Transaction sent!');
		});
	}, [
		IZorpFactory,
		addressFactory,
		amount,
		address,
		irysUploadData,
		isConnected,
		writeContractAsync,
	]);

	const { data: txResult } = useTransactionReceipt({
		query: {
			enabled: !!hash
						&& !!IZorpFactory
						&& !!amount
						&& !!address
						&& !!irysUploadData
						&& !!isConnected,
		},
		hash,
	});
	console.warn({ txResult });

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Create Study
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpFactoryAddressInput
				disabled={isPending}
				setState={setAddressFactory}
			/>

			<hr />
			<GpgEncryptionKeyFromInputFile
				labelText="Public GPG key"
				setState={setGpgKey}
			/>

			<hr />
			<IrysBalanceGet
				labelText="Check Irys balance"
				setState={setIrysBalance}
			/>

			<hr />
			<IrysUploadFileGpgKey
				labelText="Irys upload GPG key file"
				setState={setIrysUploadData}
				gpgKey={gpgKey}
				irysBalance={irysBalance}
			/>

			<hr />
			<label>Study deposit amount:</label>
			<input
				type="number"
				onChange={(event) => {
					event.stopPropagation();
					event.preventDefault();
					handleZorpFactoryCreateStudyAmount(BigInt(event.target.value));
				}}
			/>

			<hr />
			<button
				className={`zorp_factory_create_study zorp_factory_create_study__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					console.warn('ZorpFactoryWriteCreateStudy', {event});
					handleZorpFactoryWriteCreateStudy();
				}}
			>Zorp Factory Create Study</button>

			<span>Status: {message}</span>
			<span>Hash: {hash}</span>
			<span>Tx Result: {txResult?.logs?.filter((log) => log?.address != txResult?.to)?.at(0)?.address}</span>
		</div>
	);
}
