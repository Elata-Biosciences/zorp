'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import { useAccount, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import EncryptedMessageFromInputFile from '@/components/features/EncryptedMessageFromInputFile';
import GpgEncryptionKeyFromInputFile from '@/components/features/GpgEncryptionKeyFromInputFile';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysFetchFileGpgKey from '@/components/features/IrysFetchFileGpgKey';
import IrysUploadFileEncryptedMessage from '@/components/features/IrysUploadFileEncryptedMessage'
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudySubmitData() {
	const className = '';

	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	// TODO: consider reducing need of keeping both `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);

	const [irysBalance, setIrysBalance] = useState<null | bigint | number | BigNumber>(null);

	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);

	const [encryptionKey, setEncryptionKey] = useState<null | { response: Response; key: Key; }>(null);

	const [encryptedMessage, setEncryptedMessage] = useState<null | Uint8Array>(null);

	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const { writeContractAsync } = useWriteContract({
		config: config.wagmiConfig,
	});

	const { address, isConnected } = useAccount();
	const { IZorpStudy } = useContracts();

	const handleZorpStudySubmitData = useCallback(() => {
		if (!isConnected) {
			const message = 'Warn: waiting on client to connect an account';
			console.warn('ZorpStudySubmitData', {message});
			setMessage(message)
			return;
		}

		if (!address?.toString().length) {
			const message = 'Warn: waiting on client to connect an account with an address';
			console.warn('ZorpStudySubmitData', {message});
			setMessage(message)
			return;
		}

		if (!irysUploadData || !irysUploadData.cid || !irysUploadData.receipt) {
			const message = 'Warn: for Irys upload to report success';
			console.warn('ZorpStudySubmitData', {message});
			setMessage(message)
			return;
		}

		if (!IZorpStudy?.abi || !Object.keys(IZorpStudy.abi).length || !addressStudy.length) {
			const message = 'Error: no contracts found for current chain';
			console.error('ZorpStudySubmitData', {message});
			setMessage(message)
			return;
		}

		writeContractAsync({
			abi: IZorpStudy.abi,
			address: addressStudy,
			functionName: 'submitData',
			args: [
				address.toString(),
				irysUploadData.cid.toString(),
			],
		}).then((writeContractData) => {
			const message = `Result: transaction hash: ${writeContractData}`;
			console.warn('ZorpStudySubmitData', {message});
			setMessage(message)
		});
	}, [
		IZorpStudy,
		address,
		addressStudy,
		irysUploadData,
		isConnected,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Submit Data
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

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

			<ZorpStudyAddressInput
				disabled={!isConnected}
				setState={setAddressStudy}
			/>

			<hr />

			<IrysFetchFileGpgKey addressStudy={addressStudy} setState={setEncryptionKey} />

			<hr />

			<EncryptedMessageFromInputFile
				labelText='Data to encrypt and submit'
				setState={setEncryptedMessage}
				gpgKey={gpgKey}
				encryptionKey={encryptionKey}
			/>

			<hr />

			<IrysUploadFileEncryptedMessage
				labelText='Irys upload public encrypted message'
				setState={setIrysUploadData}
				encryptedMessage={encryptedMessage}
				irysBalance={irysBalance}
			/>

			<hr />

			<label className={`zorp_study_submit_data zorp_study_submit_data__label ${className}`}>
				Zorp Submit Study Data
			</label>

			<button
				className={`zorp_study_submit_data zorp_study_submit_data__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					console.warn('ZorpStudySubmitData', {event});
					handleZorpStudySubmitData();
				}}
				disabled={!isConnected}
			>Zorp Submit Study Data</button>

			<span className={`zorp_study_submit_data zorp_study_submit_data__span ${className}`}>{message}</span>

			<hr />
		</div>
	);
}
