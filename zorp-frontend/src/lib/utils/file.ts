/**
 * Wrapper to aid mockery of test _suite_
 *
 * @see {@link https://github.com/vitest-dev/vitest/discussions/7304}
 * @see {@link https://github.com/vitest-dev/vitest/issues/1759}
 * @see {@link https://github.com/jsdom/jsdom/issues/2555}
 * @see {@link https://github.com/jsdom/jsdom/issues/3206}
 */
export function fileFromUint8Array({
	array,
	name,
	options,
}: {
	array: Uint8Array;
	name: string;
	options?: FilePropertyBag;
}) {
	return new File(
		[array],
		name,
		Object.assign({ type: 'application/octet-stream' }, options)
	);
}
