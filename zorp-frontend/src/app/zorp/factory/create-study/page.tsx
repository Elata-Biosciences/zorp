'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import ThemeSwitch from '@/components/features/ThemeSwitch';

import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';

import type { Subkey, Key } from 'openpgp';
import type { BigNumber } from 'bignumber.js';

import type { WebIrysOpts } from '@/@types/irys';

export default function ZorpFactoryCreateStudy() {
	const { address, connector, isConnected } = useAccount();
	const [provider, setProvider] = useState<null | unknown>(null);

	useEffect(() => {
		if (isConnected && connector) {
			// eslint-disable-next-line no-console
			console.log('Wallet address: ', address);
			connector.getProvider().then((gottenProvider) => {
				setProvider(gottenProvider);
			});
		} else {
			// eslint-disable-next-line no-console
			console.log('Not connected');
		}
	}, [address, connector, isConnected]);

	// TODO: consider reducing need of keeping `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Subkey | Key; }>(null);

	const [irysBalance, setIrysBalance] = useState<null | number | BigNumber>(null);

	const [irysUploadFileReceipt, setIrysUploadFileReceipt] = useState<null | { receipt: unknown; cid: string; }>(null);

	const irysBalanceThreshold = 0.1;
	const webIrysOpts: WebIrysOpts = {
		token: 'WAT'
	};

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Create Study
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />

			<InputFileToGpgEncryptionKey setState={setGpgKey} labelText="Public GPG key" />

			<hr />

			<IrysBalanceGet
				setState={setIrysBalance}
				labelText="Check Irys balance"
				webIrysOpts={webIrysOpts}
				address={address}
			/>

			<hr />

			<IrysUploadFileGpgKey
				setState={setIrysUploadFileReceipt}
				labelText="Irys upload GPG key file"
				webIrysOpts={webIrysOpts}
				address={address}
				provider={provider}
				gpgKey={gpgKey}
				irysBalance={irysBalance}
				irysBalanceThreshold={irysBalanceThreshold}
			/>

			<hr />

			<hr />
		</div>
	);
}
