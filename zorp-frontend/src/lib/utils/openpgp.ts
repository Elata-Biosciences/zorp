
import * as openpgp from 'openpgp';
import type { Key } from 'openpgp';
import promiseFromFileReader from '@/lib/utils/promiseFromFileReader';

/**
 * Encrypt `file` with `keys` as recipients
 */
export async function encryptedMessageFromFile({
	file,
	keys,
}: {
	file: File;
	keys: Key[];
}) {
	const buffer = await promiseFromFileReader({
		file,
		readerMethod: ({ reader, file }) => {
			reader.readAsArrayBuffer(file);
		},
	}).then(({ result }) => {
		return new Uint8Array(result as ArrayBuffer);
	});

	const createdmessage = await openpgp.createMessage({ binary: buffer });

	return openpgp.encrypt({
		message: createdmessage,
		encryptionKeys: keys,
		// TODO: maybe figure out how to make irysUploader happy with
		//       Uint8Array returned by 'binary' format
		// format: 'armored',
		format: 'binary',
	});
}

/**
 * Extract encryption key from armored key file
 */
export async function encryptionKeyFromFile({ file }: { file: File; }) {
	const { result: armoredKey } = await promiseFromFileReader({
		file: file,
		readerMethod: ({ reader, file, encoding }) => {
			reader.readAsText(file, encoding);
		},
	}) as { result: string };

	const readKeys = await openpgp.readKey({ armoredKey });

	return await readKeys.getEncryptionKey();
}
