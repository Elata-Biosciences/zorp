'use client';

import { useCallback, useState } from 'react';
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

	const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		event.stopPropagation();
		event.preventDefault();
		console.warn('InputFileToGpgEncryptionKey', {event});

		if (!event.target.files?.length) {
			setMessage('Warn: No GPG public encrypt key selected');
			setState(null);
			return;
		}

		const file = event.target.files.item(0);
		if (!file) {
			setMessage('Warn: No GPG public encrypt key selected');
			setState(null);
			return;
		}

		const reader = new FileReader();

		reader.onload = async (event) => {
			if (!reader.result?.toString().length) {
				const message = 'Error: problem detected while reading file';
				console.error('reader.onload', {message, event});
				setMessage(message);
				setState(null);
				return;
			}

			try {
				setMessage('Info: attempting to parse file as gpg key');
				const readKeys = await openpgp.readKey({ armoredKey: reader.result.toString() });

				setMessage('Info: attempting to recover GPG encryption key');
				const encryption_key = await readKeys.getEncryptionKey();

				if (encryption_key) {
					setMessage('Success: recovered GPG encryption key from file!');
					// TODO: add runtime check to ensure type-hint casting is not a lie
					setState({ file, key: encryption_key as Key });
				} else {
					setState(null);
				}
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
	}, [ setState ]);

	return (
		<>
			<label className={`file_upload file_upload__label file_upload__label__gpg_key ${className}`}>{labelText}</label>
			<input className={`file_upload file_upload__input file_upload__input__gpg_key ${className}`}
				type="file"
				onChange={handleOnChange}
			/>
			<span className={`file_upload file_upload__span file_upload__span__gpg_key ${className}`}>{message}</span>
		</>
	)
}
