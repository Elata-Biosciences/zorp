'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import * as openpgp from 'openpgp';
import type { Key } from 'openpgp';

/**
 * @see https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#browser-webpack
 */
export default function InputFileToGpgEncryptionKey({
	className = '',
	labelText = 'Public GPG key for encryption',
	setState,
}: {
	className?: string;
	labelText: string;
	setState: (state: null | {
		file: File;
		key: Key;
	}) => void;
}) {
	const [message, setMessage] = useState<string>('Info: GPG public encryption key required');

	return (
		<>
			<label className={`file_upload file_upload__label file_upload__label__gpg_key ${className}`}>{labelText}</label>
			<input className={`file_upload file_upload__input file_upload__input__gpg_key ${className}`}
				type="file"
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					event.stopPropagation();
					event.preventDefault();
					console.warn('InputFileToGpgEncryptionKey', {event});

					if (!event.target.files?.length) {
						const message = 'Warn: No GPG public encrypt key selected';
						console.warn(message);
						setMessage(message);
						return;
					}

					const file = event.target.files.item(0);
					if (!file) {
						const message = 'Warn: No GPG public encrypt key selected';
						console.warn(message);
						setMessage(message);
						return;
					}

					const reader = new FileReader();
					reader.onload = (event) => {
						if (!reader.result?.toString().length) {
							const message = 'Error: problem detected while reading file';
							console.error('reader.onload', {message, event});
							setMessage(message);
							return;
						}

						const message = 'Info: attempting to parse file as GPG key';
						console.warn('reader.onload', {message, event});
						setMessage(message);
						try {
							openpgp.readKey({ armoredKey: reader.result.toString() }).then((key) => {
								const message = 'Info: attempting to recover GPG encryption key';
								console.warn('reader.onload -> openpgp.readKey', {message, key});
								setMessage(message);
								// TODO: add runtime check to ensure type-hint casting is not a lie
								return key.getEncryptionKey() as Promise<Key>;
							}).then((encryption_key) => {
								const message = 'Success: recovered GPG encryption key from file!';
								console.warn('reader.onload -> openpgp.readKey -> key.getEncryptionKey', {message, encryption_key});
								setMessage(message);
								setState({file, key: encryption_key});
							}).catch((error) => {
								let message = 'Error: ';
								if ('message' in error) {
									message += error.message;
								} else {
									message += error.toString();
								}

								console.error('reader.onload ...', {message, error});
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

							setMessage(message);
							setState(null);
						}
					};
					reader.onerror = () => {
						const message = 'Error: reading file failed';
						console.error(message);
						setMessage(message)
						setState(null);
					}
					reader.readAsText(file);
				}}
			/>
			<span className={`file_upload file_upload__span file_upload__span__gpg_key ${className}`}>{message}</span>
		</>
	)
}
