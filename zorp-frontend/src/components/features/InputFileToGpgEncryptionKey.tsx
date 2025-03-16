'use client';

import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as openpgp from 'openpgp';
import type { Key } from 'openpgp';
import promiseFromFileReader from '@/lib/utils/promiseFromFileReader';

/**
 * @see https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#browser-webpack
 *
 * @warning `Key` is _really_ of type `Subkey` **but** OpenPGP JS has kinda
 * funky `Key | Subkey` hint that MicroSoft™ TypeScript® doesn't take kindly to
 * attached on `await openpgp.readKey().then((key) => key.getEncryptionKey())`
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
	const [file, setFile] = useState<null | File>(null);

	useQuery({
		enabled: !!setState && !!file,
		queryKey: ['Participant_GPG_Key'],
		queryFn: async () => {
			if (!file) {
				const message = 'Warn: need a public GPG key as input file';
				setMessage(message);
				return;
			}

			try {
				const { result: armoredKey } = await promiseFromFileReader({
					file: file,
					readerMethod: ({ reader, file, encoding }) => {
						reader.readAsText(file, encoding);
					},
				}) as { result: string };

				const readKeys = await openpgp.readKey({ armoredKey });
				const encryption_key = await readKeys.getEncryptionKey();

				if (encryption_key) {
					setMessage('Success: recovered GPG encryption key from file!');
					// TODO: add runtime check to ensure type-hint casting is not a lie
					setState({ file, key: encryption_key as Key });
				} else {
					setState(null);
				}

				return encryption_key;
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

				console.error('InputFileToEncryptedMessage', {message, error});
				setMessage(message);
				setState(null);

				return error;
			}
		},
	});

	const onChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		event.stopPropagation();
		event.preventDefault();
		if (!!event.target.files?.length) {
			setFile(event.target.files[0]);
			// TODO: update test(s) to allow for _proper_ usage
			// setFile(event.target.files.item(0));
		} else {
			setFile(null);
		}
	}, [ setFile ]);

	return (
		<>
			<label className={`file_upload file_upload__label file_upload__label__gpg_key ${className}`}>{labelText}</label>
			<input className={`file_upload file_upload__input file_upload__input__gpg_key ${className}`}
				type="file"
				onChange={onChangeHandler}
			/>
			<span className={`file_upload file_upload__span file_upload__span__gpg_key ${className}`}>{message}</span>
		</>
	)
}
