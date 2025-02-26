import { getContract, parseAbi } from 'viem';
import type { Client, GetContractReturnType } from 'viem';

/**
 * Wrapper for `viem.getContract`
 *
 * TODO: maybe add extra type _hints_ for return type?
 */
function getNamedContract({
	name,
	address,
	client,
}: {
	name: string;
	address: `0x${string}`;
	client: Client /* | KeyedClient */;
}) {
	return fetch(`/assets/abi/${name}.json`)
		.then((response) => {
			if (!response.ok) throw new Error('No contract?!');
			return response.json();
		})
		.then((json) => {
			if (!('abi' in json)) {
				throw new Error('No contract ABI?!');
			}
			return json.abi;
		})
		.then((abi) => {
			return getContract({
				address,
				abi: parseAbi(abi),
				client: client,
			});
		});
}

/**
 * Fetch the `IZorpStudy.json` ABI and return contract instance
 *
 * TODO: maybe add extra type _hints_ for return type?
 */
export function getZorpStudy({
	address,
	client,
}: {
	address: `0x${string}`;
	client: Client /* | KeyedClient */;
}): Promise<GetContractReturnType> {
	return getNamedContract({
		name: 'IZorpStudy',
		address,
		client,
	});
}

/**
 * Fetch the `IZorpFactory.json` ABI and return contract instance
 *
 * TODO: maybe add extra type _hints_ for return type?
 */
export function getZorpFactory({
	address,
	client,
}: {
	address: `0x${string}`;
	client: Client /* | KeyedClient */;
}): Promise<GetContractReturnType> {
	return getNamedContract({
		name: 'IZorpFactory',
		address,
		client,
	});
}
