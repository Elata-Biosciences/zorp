/**
 * @see {@link https://github.com/vitest-dev/vitest/issues/4043}
 * @see ../__tests__/InputFileToEncryptedMessage.test.tsx
 */

import { TextDecoder, TextEncoder } from 'text-encoding-utf-8';

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

