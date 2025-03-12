'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as openpgp from 'openpgp';
import type { Key } from 'openpgp';

export default function InputFileToEncryptedMessage({
	className = '',
	labelText = 'Data to encrypt and submit',
	setState,
	gpgKey,
	encryptionKey,
}: {
	className?: string;
	setState: (study_encrypted_message: null | Uint8Array) => void;
	labelText: string;
	gpgKey: null | { file: File; key: Key; };
	encryptionKey: null | { response: Response; key: Key; };
}) {
	const [inputSubmitDataFile, setInputSubmitDataFile] = useState<null | File>(null);
	const [message, setMessage] = useState<string>('Info: waiting for public GPG encryption keys and or input file');

	useQuery({
		enabled: !!inputSubmitDataFile && !!gpgKey && !!gpgKey.key && !!encryptionKey && !!encryptionKey.key,
		queryKey: ['message_recipients'],
		// TODO: investigate circular reference errors in tests possibly propagating to web-clients
		// queryKey: ['message_recipients', [gpgKey?.key, encryptionKey?.key]],
		queryFn: async () => {
			// TODO: investigate why TypeScript and `useQuery` don't sync-up on `enabled`
			if (!gpgKey?.key) {
				const message = 'Warn: input GPG encryption key';
				console.warn('InputFileToEncryptedMessage', {message});
				setMessage(message);
				return;
			}

			if (!encryptionKey?.key) {
				const message = 'Warn: study GPG encryption key';
				console.warn('InputFileToEncryptedMessage', {message});
				setMessage(message);
				return;
			}

			if (!inputSubmitDataFile) {
				const message = 'Warn: need an input file to encrypt';
				console.warn('InputFileToEncryptedMessage', {message});
				setMessage(message);
				return;
			}

			try {
				console.log('InputFileToEncryptedMessage ->', { 'inputSubmitDataFile.text': inputSubmitDataFile.text });
				const buffer = await inputSubmitDataFile.arrayBuffer();

				const createdmessage = await openpgp.createMessage({ binary: buffer });

				const encryptedMessage = await openpgp.encrypt({
					message: createdmessage,
					encryptionKeys: [gpgKey.key, encryptionKey.key],
					// TODO: maybe figure out how to make irysUploader happy with
					//       Uint8Array returned by 'binary' format
					// format: 'armored',
					format: 'binary',
				});

				const message = 'Success: encrypted file with provided GPG keys?!';
				console.warn('InputFileToEncryptedMessage', {message});
				setMessage(message);
				setState(encryptedMessage);
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
			}
		},
	});

	return (
		<>
			<label className={`file_encrypt file_encrypt__label ${className}`}>{labelText}</label>
			<input
				className={`file_encrypt file_encrypt__input ${className}`}
				type="file"
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					event.stopPropagation();
					event.preventDefault();
					console.warn({ 'event.target.files': event.target.files });
					if (!!event.target.files?.length) {
						setInputSubmitDataFile(event.target.files[0]);
					} else {
						setInputSubmitDataFile(null);
					}
				}}
			/>
			<span className={`file_encrypt file_encrypt__span ${className}`}>{message}</span>
		</>
	);
}
