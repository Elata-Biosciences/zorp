'use client';

import { useState } from 'react';
import { WebUploader } from '@irys/web-upload';
import { WebBaseEth } from '@irys/web-upload-ethereum';
import type { BigNumber } from 'bignumber.js';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import type { Digest } from 'multiformats/src/hashes/digest';
import type { Subkey, Key } from 'openpgp';
import { useAccount } from 'wagmi';
import { irysBalanceThreshold } from '@/lib/constants/irysConfig';

export default function IrysUploadFileGpgKey({
	className = '',
	labelText = 'Irys upload public GPG encryption key',
	setState,
	gpgKey,
	irysBalance,
}: {
	className?: string;
	labelText: string;
	setState: (state: null | {
		receipt: unknown;
		cid: string;
	}) => void;
	gpgKey: null | { file: File; key: Subkey | Key; };
	irysBalance: null | (number | BigNumber);
}) {
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const { address, connector } = useAccount();

	return (
		<>
			<label className={`irys_upload_file irys_upload_file__label ${className}`}>{labelText}</label>

			<button
				className={`irys_upload_file irys_upload_file__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();

					console.warn('IrysUploadFileGpgKey', {event});

					if (!address) {
						const message = 'Info: waiting for client to connect wallet with an address';
						console.warn('IrysUploadFileGpgKey', {message, address});
						setMessage(message);
						return;
					}

					if (!gpgKey) {
						const message = 'Info: waiting for client to provide GPG key';
						console.warn('IrysUploadFileGpgKey', {message, address});
						setMessage(message);
						return;
					}

					if (!irysBalance || irysBalance <= irysBalanceThreshold) {
						const message = 'Info: waiting for client to fund Irys for upload';
						console.warn('IrysUploadFileGpgKey', {message, address});
						setMessage(message);
						return;
					}

					const message = 'Info: attempting to convert GPG key to ArrayBuffer';
					console.warn('IrysUploadFileGpgKey', {message});
					setMessage(message);
					try {
						gpgKey.file.arrayBuffer().then((buffer) => {
							const message = 'Info: attempting SHA ArrayBuffer';
							console.warn('IrysUploadFileGpgKey', {message});
							setMessage(message);
							return (sha256.digest(raw.encode(new Uint8Array(buffer))) as Promise<Digest<number, number>>)
								.then((hash) => {
									const message = 'Info: attempting generate an IPFS compatible CID';
									console.warn('IrysUploadFileGpgKey', {message});
									setMessage(message);
									return CID.create(1, raw.code, hash);
								})
								.then((cid) => {
									const message = 'Info: attempting to initalize Irys Web Uploader';
									console.warn('IrysUploadFileGpgKey', {message});
									setMessage(message);

									WebUploader(WebBaseEth).withProvider(connector)
										.then((irysUploadBuilder) => {
											const message = 'Info: attempting to upload GPG key to Irys';
											console.warn('IrysUploadFileGpgKey', {message});
											setMessage(message);

											const tags = [
												{ name: 'Content-Type', value: 'application/pgp-encrypted' },
												{ name: 'IPFS-CID', value: cid.toString() },
											];

											// TODO: maybe configure `opts` AKA CreateAndUploadOptions
											return irysUploadBuilder.uploader.uploadData(
												Buffer.from(buffer),
												{ tags },
											);
										}).then((receipt) => {
											const message = 'Success: Uploded GPG key to Irys?!';
											console.warn('IrysUploadFileGpgKey', {message, receipt, cid});
											setMessage(message);

											setState({ receipt, cid: cid.toString() });
										});
								});
						}).catch((error) => {
							let message = 'Error: ';
							if ('message' in error) {
								message += error.message;
							} else {
								message += error.toString();
							}

							console.error('IrysUploadFileGpgKey ...', {message, error});
							setMessage(message);
							setState(null);
						});
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

						console.error('IrysUploadFileGpgKey ...', {message, error});
						setMessage(message);
						setState(null);
					}
				}}
			>Upload GPG key to Irys</button>

			<span className={`irys_upload_file irys_upload_file__span ${className}`}>{message}</span>
		</>
	);
}
