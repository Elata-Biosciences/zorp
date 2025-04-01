import * as openpgp from 'openpgp';
import * as irysConfig from '@/lib/constants/irysConfig';

export async function getIrysResponseFromCid(cid: string) {
	const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
	return await fetch(url);
}

/**
 * Wrapper to aid mocked testing and reduce run-time boilerplate
 */
export async function getGpgKeyFromCid(cid: string) {
	const response = await getIrysResponseFromCid(cid);
	if (response.ok) {
		const text = await response.text();
		const key = await openpgp.readKey({ armoredKey: text });
		return { key, response };
	}

	return { response };
}
