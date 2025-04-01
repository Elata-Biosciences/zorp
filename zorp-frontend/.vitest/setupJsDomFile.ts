/**
 * @see {@link https://github.com/jsdom/jsdom/issues/2555}
 */
if (!('arrayBuffer' in File)) {
	File.prototype.arrayBuffer = async function() {
		return new ArrayBuffer(this);
	}
}
