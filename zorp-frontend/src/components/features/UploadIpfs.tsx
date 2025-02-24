// TODO: investigate why TypeScript no likes '@/lib/utils/openpgpUtils'
import { openPgpEncrypt } from '../../lib/utils/openpgpUtils';

import type { ChangeEvent } from 'react';

export default function UploadIpfs({ className }: { className?: string }) {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/files
	 * @see https://github.com/microsoft/TypeScript/issues/31816
	 */
	const fileHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target?.files?.length) {
			throw new Error('No file provided');
		}
		event.stopPropagation();
		event.preventDefault();

		const file = event.target.files[0];

		const plaintext = await file.text();
		// TODO: get from context/session/state-storage
		const publicKeysArmored = [];

		const cypherText = await openPgpEncrypt(plaintext, publicKeysArmored);

		// TODO: maybe convert `cypherText` into file-like blob
		// TODO: submit encrypted data to IPFS
	};

	return (
		<>
			<label>Upload</label>

			<input
				className={className}
				type="file"
				onChange={fileHandler}
			/>
		</>
	);
}
