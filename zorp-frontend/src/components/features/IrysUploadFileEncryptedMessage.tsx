'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import { fileFromUint8Array } from '@/lib/utils/file';
import { cidFromFile } from '@/lib/utils/ipfs';
import { getIrysResponseFromCid } from '@/lib/utils/irys';
import { useIrysWebUploaderBuilderBaseEth } from '@/hooks/useIrys';
import * as irysConfig from '@/lib/constants/irysConfig';

/**
 * @see {@link https://github.com/wevm/wagmi/discussions/4297}
 * @see {@link https://wagmi.sh/react/guides/ethers}
 * @see {@link https://github.com/wevm/wagmi/discussions/2615}
 * @see {@link https://wagmi.sh/react/ethers-adapters}
 * @see {@link https://docs.irys.xyz/build/d/sdk/upload/uploadFile}
 */
export default function IrysUploadFileEncryptedMessage({
	className = '',
	labelText = 'Irys upload public encrypted message',
	setState,
	encryptedMessage,
	irysBalance,
}: {
	className?: string;
	labelText: string;
	setState: (state: null | {
		receipt: unknown;
		cid: string;
	}) => void;
	encryptedMessage: null | Uint8Array;
	irysBalance: null | (number | bigint | BigNumber);
}) {
	const [cid, setCid] = useState<null | string>(null);
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const [maybePreexistingEncryptedMessageFile, setMaybePreexistingEncryptedMessageFile] = useState<null | Blob>(null);
	const irysWebUploaderBuilderBaseEth = useIrysWebUploaderBuilderBaseEth();

	const handleOnClick = useCallback(async () => {
		if (!!maybePreexistingEncryptedMessageFile && !!cid) {
			const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
			setMessage(`Info: encrypted file already uploaded at -> ${url}`);
			setState({ cid, receipt: undefined });
			return;
		};

		if (!encryptedMessage) {
			setMessage('Info: waiting for client to provide encrypted message');
			setState(null);
			return;
		}

		const file = fileFromUint8Array({
			array: encryptedMessage,
			name: 'study-data',
		});

		if (file.size >= irysConfig.irysThreshold.fileSizeMaxFree) {
			if (!irysBalance || irysBalance <= irysConfig.irysThreshold.minimumBalance) {
				setMessage('Info: waiting for client to fund Irys for upload');
				setState(null);
				return;
			}
		}

		if (!irysWebUploaderBuilderBaseEth) {
			setMessage('Info: waiting for Irys Web Uploader Builder to connect');
			setState(null);
			return;
		}

		/* @TODO: attempt to download before checking if upload is needed/possible */

		try {
			setMessage('Info: attempting to generate CID from encrypted message as file');
			const cid = await cidFromFile(file);
			setCid(cid);

			const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
			setMessage(`Info: attempting to download file from ${url}`);

			const response = await getIrysResponseFromCid(cid);
			if (response.ok) {
				setMessage(`Info: encrypted file already uploaded at -> ${url}`);
				setState({ cid, receipt: undefined });
				const blob = await response.blob();
				setMaybePreexistingEncryptedMessageFile(blob);
				return blob;
			}

			setMessage('Info: attempting to initalize Irys Web Uploader');
			const irysUploaderWebBaseEth = await irysWebUploaderBuilderBaseEth.build();

			setMessage('Info: attempting to upload encrypted file to Irys');
			const buffer = await file.arrayBuffer();
			// TODO: maybe configure `opts` AKA CreateAndUploadOptions
			const receipt = await irysUploaderWebBaseEth.uploader.uploadData(
				Buffer.from(buffer),
				{
					tags: [
						{ name: 'Content-Type', value: 'application/octet-stream' },
						{ name: 'IPFS-CID', value: cid },
					]
				},
			);

			setMessage(`Success: Uploded encrypted file to Irys?! JSON: '{ "id": "${receipt.id}", "cid": "${cid}", "url": "${url}" }'`);
			const state = { receipt, cid };
			setState(state);
			return state;
		} catch (error: unknown) {
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

			console.error('IrysUploadFileEncryptedMessage ...', { message, error });
			setMessage(message);
			setState(null);
			return error;
		}
	}, [
		cid,
		encryptedMessage,
		irysBalance,
		irysWebUploaderBuilderBaseEth,
		maybePreexistingEncryptedMessageFile,
		setState,
	]);

	return (
		<>
			<label className={`irys_upload_file irys_upload_file__label ${className}`}>{labelText}</label>

			<button
				className={`irys_upload_file irys_upload_file__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					handleOnClick();
				}}
			>Upload Encrypted file to Irys</button>

			<span className={`irys_upload_file irys_upload_file__span ${className}`}>{message}</span>
		</>
	);
}
