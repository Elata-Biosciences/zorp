'use client';

import * as openpgp from 'openpgp';

import { useQuery } from '@tanstack/react-query';

import { useEffect, useState } from 'react';

import type { ChangeEvent } from 'react';
import type { Key } from 'openpgp';

export default function InputFileToEncryptedMessage({
	className = '',
	labelText = 'Data to encrypt and submit',
	setState,
	gpgKey,
	encryptionKey,
}: {
	className?: string;
	setState: (study_encryption_key: null | Uint8Array) => void;
	labelText: string;
	gpgKey: null | { file: File; key: Key; };
	encryptionKey: null | { response: Response; key: Key; };
}) {
	const [inputSubmitDataFile, setInputSubmitDataFile] = useState<null | File>(null);
	const [message, setMessage] = useState<string>('Info: waiting for public GPG encryption keys and or input file');

	const { data: encryptedMessage } = useQuery({
		enabled: !!inputSubmitDataFile && !!gpgKey && !!gpgKey.key && !!encryptionKey && !!encryptionKey.key,
		queryKey: ['message_recipients', [gpgKey?.key, encryptionKey?.key]],
		queryFn: () => {
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

			const message = 'Info: attempting to convert input file to ArrayBuffer';
			console.log('InputFileToEncryptedMessage', {message});
			setMessage(message);
			inputSubmitDataFile.arrayBuffer()
				.then((buffer) => {
					return openpgp.createMessage({ binary: buffer })
				})
				.then((createdmessage) => {
					const message = 'Info: attempting encrypt file with GPG keys';
					console.log('InputFileToEncryptedMessage', {message});
					setMessage(message);
					return openpgp.encrypt({
						message: createdmessage,
						encryptionKeys: [gpgKey.key, encryptionKey.key],
						// TODO: maybe figure out how to make irysUploader happy with
						//       Uint8Array returned by 'binary' format
						// format: 'armored',
						format: 'binary',
					});
				})
				.then((encryptedMessage) => {
					const message = 'Success: encrypted file with provided GPG keys?!';
					console.log('InputFileToEncryptedMessage', {message});
					setMessage(message);
					setState(encryptedMessage);
				});
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
					setInputSubmitDataFile(event.target.files?.item(0) || null);
				}}
			/>
			<span className={`file_encrypt file_encrypt__span ${className}`}>{message}</span>
		</>
	);
}
