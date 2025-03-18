import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: 'jsdom',
		/* CI/CD needs more time to cook */
		testTimeout: 900141968,
		setupFiles: [
			'.vitest/setupJsDomFile.ts',
			'.vitest/setupTextEncoding.ts',
		],
	},
});
