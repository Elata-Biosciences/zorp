
/**
 * Wrapper for `FileReader` that returns a Promise that can be awaited
 *
 * @param o.file - File to read with FileReader
 *
 * @param o.encoding - Optional if using `readAsText` and not used otherwise
 *
 * @param o.readerMethod - wrapper for `readAsArrayBuffer`, `readAsBinaryString`, `readAsDataURL`, or `readAsText` methods on `FileReader` instance
 */
export default function promiseFromFileReader({ file, encoding, readerMethod }: {
	file: Blob,
	encoding?: string,
	readerMethod: ({reader, file, encoding}: {
		reader: FileReader,
		file: Blob,
		encoding?: string
	}) => void
}): Promise<{event: ProgressEvent<FileReader>, result: FileReader['result']}> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			resolve({ event, result: reader.result });
		};

		reader.onerror = (event) => {
			reject(event);
		}

		readerMethod({
			reader,
			file,
			encoding,
		})
	});
}

