import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

/**
 * @dev Warning: NodeJS, for reasons, believes the `File` object does not
 * deserve the `arrayBuffer` method!  Use the following cursed code to coerce
 * more web-browser like behavior in your server-side code
 *
 * ```javascript
 * const file = new File(['wat'], 'name');
 * file.arrayBuffer = async () => new ArrayBuffer(file);
 * ```
 */
export async function cidFromFile(file: File) {
	const buffer = await file.arrayBuffer();
	const hash = await sha256.digest(raw.encode(new Uint8Array(buffer)));
	const cid = await CID.create(1, raw.code, hash);
	return cid.toString();
}
