'use client';

import { WebIrys } from '@irys/sdk';
import { WebUploader } from '@irys/web-upload';
import { WebBaseEth } from '@irys/web-upload-ethereum';

import { useEffect, useState } from 'react';

import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

import type { BigNumber } from 'bignumber.js';
import type { ChangeEvent } from 'react';
import type { Network, IrysConfig } from '@irys/sdk/build/cjs/common/types.d.ts';
import type { Subkey, Key } from 'openpgp';
import type { Digest } from 'multiformats/src/hashes/digest';

import type { WebIrysOpts } from '@/@types/irys';

export default function IrysUploadFileGpgKey({
	className = '',
	labelText = 'Irys upload public GPG encryption key',
	setState,
	webIrysOpts,
	address,
	provider,
	gpgKey,
	irysBalance,
	irysBalanceThreshold,
}: {
	className?: string;
	labelText: string;
	setState: (state: null | {
		receipt: unknown;
		cid: string;
	}) => void;
	webIrysOpts: WebIrysOpts;
	address: string | `0x${string}` | undefined;
	provider: unknown;
	gpgKey: null | { file: File; key: Subkey | Key; };
	irysBalance: null | (number | BigNumber);
	irysBalanceThreshold: number | BigNumber;
}) {
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');

	return (
		<>
			<label className={`irys_upload_file irys_upload_file__label ${className}`}>{labelText}</label>

			<button
				className={`irys_upload_file irys_upload_file__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();

					console.log('IrysUploadFileGpgKey', {event});

					if (!address) {
						const message = 'Info: waiting for client to connect wallet with an address';
						console.log('IrysUploadFileGpgKey', {message, address});
						setMessage(message);
						return;
					}

					if (!gpgKey) {
						const message = 'Info: waiting for client to provide GPG key';
						console.log('IrysUploadFileGpgKey', {message, address});
						setMessage(message);
						return;
					}

					if (!irysBalance || irysBalance <= irysBalanceThreshold) {
						const message = 'Info: waiting for client to fund Irys for upload';
						console.log('IrysUploadFileGpgKey', {message, address});
						setMessage(message);
						return;
					}

					const message = 'Info: attempting to convert GPG key to ArrayBuffer';
					console.log('IrysUploadFileGpgKey', {message});
					setMessage(message);
					try {
						gpgKey.file.arrayBuffer().then((buffer) => {
							const message = 'Info: attempting SHA ArrayBuffer';
							console.log('IrysUploadFileGpgKey', {message});
							setMessage(message);
							return (sha256.digest(raw.encode(new Uint8Array(buffer))) as Promise<Digest<number, number>>)
								.then((hash) => {
									const message = 'Info: attempting generate an IPFS compatible CID';
									console.log('IrysUploadFileGpgKey', {message});
									setMessage(message);
									return CID.create(1, raw.code, hash);
								})
								.then((cid) => {
									const message = 'Info: attempting to initalize Irys Web Uploader';
									console.log('IrysUploadFileGpgKey', {message});
									setMessage(message);

									WebUploader(WebBaseEth).withProvider(provider)
										.then((irysUploadBuilder) => {
											const message = 'Info: attempting to upload GPG key to Irys';
											console.log('IrysUploadFileGpgKey', {message});
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
											console.log('IrysUploadFileGpgKey', {message, receipt, cid });
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
					} catch (error: any) {
						let message = 'Error: ';
						if ('message' in error) {
							message += error.message;
						} else {
							message += error.toString();
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
