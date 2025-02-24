import openpgp from 'openpgp';

/**
 * ```
 * (async () => {
 *   const plainText = 'Something for select recipients only';
 *
 *   const publicKeysArmored = [
 *     '-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----',
 *     '-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----',
 *   ];
 *
 *   const encryptedText = await openPgpEncrypt(plainText, publicKeysArmored);
 *
 *   console.log(encryptedText);
 * })();
 * ```
 */
export async function openPgpEncrypt(
	plainText: string,
	publicKeysArmored: string[]
) {
	const publicKeys = await Promise.all(
		publicKeysArmored.map((armoredKey) => openpgp.readKey({ armoredKey }))
	);

	const message = await openpgp.createMessage({ text: plainText });

	return openpgp.encrypt({ message, encryptionKeys: publicKeys });
}
