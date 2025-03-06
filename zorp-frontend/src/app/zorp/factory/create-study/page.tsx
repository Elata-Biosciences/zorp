'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import { useAccount, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryWriteCreateStudy() {
	const className = '';

	// TODO: consider reducing need of keeping bot `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);
	const [irysBalance, setIrysBalance] = useState<null | number | BigNumber>(null);
	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');

	const { writeContractAsync } = useWriteContract({
		config: config.wagmiConfig,
	});

	const { address, isConnected } = useAccount();
	const { ZorpFactory } = useContracts();

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
		if (!irysUploadData || !irysUploadData.cid || !irysUploadData.receipt) {
			const message = 'Warn: for Irys upload to report success';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (
			!ZorpFactory
			|| !ZorpFactory?.abi
			|| !Object.keys(ZorpFactory?.abi).length
			|| !ZorpFactory?.address.length
		) {
			const message = 'Error: cannot find ZorpFactory for current chain';
			console.error('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		const message = 'Warn: starting blockchain write request to `ZorpFactory.createStudy`';
		console.warn('ZorpFactoryWriteCreateStudy', {message});
		setMessage(message)
		writeContractAsync({
			abi: ZorpFactory.abi,
			address: ZorpFactory.address,
			functionName: 'createStudy',
			args: [
				address.toString(),
				irysUploadData.cid.toString(),
			],
		}).then((writeContractData) => {
			const message = `Result: transaction hash: ${writeContractData}`;
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
		});
	}, [isConnected, address, irysUploadData, writeContractAsync, ZorpFactory]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Create Study
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />
			<InputFileToGpgEncryptionKey
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
			<button
				className={`zorp_factory_create_study zorp_factory_create_study__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					console.info('ZorpFactoryWriteCreateStudy', {event});
					handleZorpFactoryWriteCreateStudy();
				}}
			>Zorp Factory Create Study</button>

			<span>Status: {message}</span>
		</div>
	);
}
