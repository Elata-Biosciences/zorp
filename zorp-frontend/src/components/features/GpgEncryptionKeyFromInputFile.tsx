'use client';

import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Key } from 'openpgp';
import { encryptionKeyFromFile } from '@/lib/utils/openpgp';
import { IoDocumentText, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';

/**
 * @see https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#browser-webpack
 *
 * @warning `Key` is _really_ of type `Subkey` **but** OpenPGP JS has kinda
 * funky `Key | Subkey` hint that MicroSoft™ TypeScript® doesn't take kindly to
 * attached on `await openpgp.readKey().then((key) => key.getEncryptionKey())`
 */
export default function GpgEncryptionKeyFromInputFile({
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
	const [message, setMessage] = useState<string>('Choose a GPG public key file (.asc, .gpg, .pub)');
	const [file, setFile] = useState<null | File>(null);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	useQuery({
		enabled: !!setState && !!file,
		queryKey: ['Participant_GPG_Key'],
		queryFn: async () => {
			if (!file) {
				const message = 'Please select a public GPG key file';
				setMessage(message);
				setIsSuccess(false);
				return;
			}

			try {
				const encryption_key = await encryptionKeyFromFile({ file });

				if (encryption_key) {
					setMessage('GPG key loaded successfully!');
					setIsSuccess(true);
					// TODO: add runtime check to ensure type-hint casting is not a lie
					setState({ file, key: encryption_key as Key });
				} else {
					setState(null);
					setIsSuccess(false);
				}

				return encryption_key;
			} catch (error: unknown) {
				let message = 'Error loading GPG key: ';
				if (!!error && typeof error == 'object') {
					if ('message' in error) {
						message += error.message;
					} else if ('toString' in error) {
						message += error.toString();
					} else {
						message += `${error}`;
					}
				} else {
					message += `${error}`;
				}

				console.error('GpgEncryptionKeyFromInputFile ->', { message, error });
				setMessage(message);
				setIsSuccess(false);
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
			setMessage('Processing GPG key...');
			setIsSuccess(false);
			// TODO: update test(s) to allow for _proper_ usage
			// setFile(event.target.files.item(0));
		} else {
			setFile(null);
			setMessage('Choose a GPG public key file (.asc, .gpg, .pub)');
			setIsSuccess(false);
		}
	}, [ setFile ]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center gap-3">
				<div className="relative">
					<input
						type="file"
						accept=".asc,.gpg,.pub,.key"
						onChange={onChangeHandler}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
						id="gpg-file-input"
					/>
					<label
						htmlFor="gpg-file-input"
						className="inline-flex items-center justify-center px-4 py-2 bg-white border-2 border-gray2 text-offBlack font-sf-pro font-medium text-sm rounded-lg cursor-pointer hover:bg-gray1/20 hover:border-elataGreen/50 transition-all duration-200 shadow-sm mr-4"
					>
						<IoDocumentText className="w-4 h-4 mr-2" />
						Choose File
					</label>
				</div>
				
				{file && (
					<div className="flex items-center text-gray3 text-sm">
						<span className="truncate max-w-48">{file.name}</span>
					</div>
				)}
				
				{isSuccess && (
					<div className="flex items-center text-elataGreen text-sm">
						<IoCheckmarkCircle className="w-4 h-4 mr-1" />
						<span>Key loaded</span>
					</div>
				)}
			</div>
			
			<div className={`text-sm font-sf-pro flex items-start gap-2 ${
				isSuccess ? 'text-elataGreen' : 
				message.includes('Error') ? 'text-accentRed' : 
				'text-gray3'
			}`}>
				{message.includes('Error') && <IoWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />}
				<span>{message}</span>
			</div>
		</div>
	)
}
