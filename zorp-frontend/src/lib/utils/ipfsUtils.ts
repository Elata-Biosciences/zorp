import { verifiedFetch } from '@helia/verified-fetch';

/**
 * @see https://www.npmjs.com/package/@helia/verified-fetch
 */
export async function fetchIpfsGpgKey(url: string) {
	return verifiedFetch(url).then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to fetch url: ${url}`);
		}
		return response.text();
	});
}
