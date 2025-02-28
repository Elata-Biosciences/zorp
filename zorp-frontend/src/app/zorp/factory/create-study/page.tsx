'use client';

import { useEffect, useState } from 'react';

import {
	useAccount,
	useReadContract,
	useWalletClient,
	useWriteContract
} from 'wagmi';

import ThemeSwitch from '@/components/features/ThemeSwitch';

import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';
import * as config from '@/lib/constants/wagmiConfig';

import { abi as ZorpFactoryABI } from 'abi/IZorpFactory.json';

import type { BigNumber } from 'bignumber.js';
import type { Subkey, Key } from 'openpgp';
import type { WebIrysOpts } from '@/@types/irys';

export default function ZorpFactoryCreateStudy() {
	const className = '';

	const { address, connector, isConnected } = useAccount();
	const [provider, setProvider] = useState<null | unknown>(null);

	useEffect(() => {
		if (isConnected && connector) {
			// eslint-disable-next-line no-console
			console.log('ZorpFactoryCreateStudy', {isConnected, address});
			connector.getProvider().then((gottenProvider) => {
				setProvider(gottenProvider);
			});
		} else {
			// eslint-disable-next-line no-console
			console.log('ZorpFactoryCreateStudy -- Not connected');
		}
	}, [address, connector, isConnected]);

	// TODO: consider reducing need of keeping bot `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Subkey | Key; }>(null);

	const [irysBalance, setIrysBalance] = useState<null | number | BigNumber>(null);

	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);

	const [zorpFactoryCreateStudy, setZorpFactoryCreateStudy] = useState<null>(null);

	const irysBalanceThreshold = 0.1;
	const webIrysOpts: WebIrysOpts = {
		token: 'WAT'
	};

	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const { data: writeZorpFactoryCreateStudy, writeContractAsync } = useWriteContract({
		config: config.wagmiConfig,
	});
	useEffect(() => {
	}, []);

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
				webIrysOpts={webIrysOpts}
				address={address}
			/>

			<hr />

			<IrysUploadFileGpgKey
				labelText="Irys upload GPG key file"
				setState={setIrysUploadData}
				webIrysOpts={webIrysOpts}
				address={address}
				provider={provider}
				gpgKey={gpgKey}
				irysBalance={irysBalance}
				irysBalanceThreshold={irysBalanceThreshold}
			/>

			<hr />

			<label className={`zorp_factory_create_study zorp_factory_create_study__label ${className}`}>
				Zorp Factory Create Study
			</label>

			<button
				className={`zorp_factory_create_study zorp_factory_create_study__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();

					console.log('ZorpFactoryCreateStudy', {event});

					if (!isConnected) {
						const message = 'Warn: waiting on client to connect an account';
						console.warn('ZorpFactoryCreateStudy', {message});
						setMessage(message)
						return;
					}
					if (!address?.toString().length) {
						const message = 'Warn: waiting on client to connect an account with an address';
						console.warn('ZorpFactoryCreateStudy', {message});
						setMessage(message)
						return;
					}
					if (!irysUploadData || !irysUploadData.cid || !irysUploadData.receipt) {
						const message = 'Warn: for Irys upload to report success';
						console.warn('ZorpFactoryCreateStudy', {message});
						setMessage(message)
						return;
					}

					// TODO: set `chainName` and `sourceId` dynamically or via `.env.<thang>` file
					const chainName = 'anvil';
					const sourceId = 31337
					writeContractAsync({
						abi: ZorpFactoryABI,
						address: config[chainName].contracts.ZorpFactory[sourceId].address,
						functionName: 'createStudy',
						args: [
							address.toString(),
							irysUploadData.cid.toString(),
						],
					}).then((writeContractData) => {
						const message = `Result: transaction hash: ${writeContractData}`;
						console.log('ZorpFactoryCreateStudy', {message});
						setMessage(message)
					});
				}}
			>Zorp Factory Create Study</button>

			<span className={`zorp_factory_create_study zorp_factory_create_study__span ${className}`}>{message}</span>

			<hr />
		</div>
	);
}
