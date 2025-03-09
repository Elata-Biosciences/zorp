/**
 * @see {@link https://github.com/jsdom/jsdom/issues/2524}
 * @see {@link https://github.com/vercel/next.js/issues/49397}
 * @see {@link https://stackoverflow.com/questions/57712235/referenceerror-textencoder-is-not-defined-when-running-react-scripts-test/57713960#57713960}
 */

import JSDOMEnvironment from 'jest-environment-jsdom';
import { TextDecoder, TextEncoder } from 'util';

export default class CustomEnvironment extends JSDOMEnvironment {
	async setup() {
		await super.setup();
		if (typeof this.global.TextEncoder == 'undefined') {
			this.global.TextEncoder = TextEncoder;
			this.global.TextDecoder = TextDecoder;
		}
	}
}

