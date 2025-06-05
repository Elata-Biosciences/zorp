import '@rainbow-me/rainbowkit/styles.css';
import { defineChain } from 'viem';
import { chainConfig } from 'viem/op-stack';
import { http, fallback } from 'wagmi';
import { arbitrum, base, mainnet, sepolia as sepoliaDefaults } from 'wagmi/chains';
import { getDefaultConfig, WalletList } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  coin98Wallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  uniswapWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { IZorpFactory } from '@/lib/constants/wagmiContractConfig/IZorpFactory';
import { IZorpStudy } from '@/lib/constants/wagmiContractConfig/IZorpStudy';

/**
 * WalletConnect Project ID
 * @description Required for all dApps using WalletConnect. Get your free projectId at
 * @see https://cloud.walletconnect.com/sign-in
 * TODO: move this to a config
 */
const projectId = 'e28b2de87c7619411e6b06064d734093';

/**
 * RPC Configuration
 * @description Default RPC endpoints with fallbacks
 */
const RPC_URLS = {
  MAINNET: [
    mainnet.rpcUrls.default.http[0], // Default RPC
    'https://rpc.ankr.com/eth', // Ankr
    'https://eth.llamarpc.com', // Llama
  ],
  ARBITRUM: [
    arbitrum.rpcUrls.default.http[0], // Default RPC
    'https://rpc.ankr.com/arbitrum', // Ankr
    'https://arbitrum.llamarpc.com', // Llama
  ],
  BASE: [
    base.rpcUrls.default.http[0], // Default RPC
    'https://base-rpc.publicnode.com', // Public Node
    'https://base.llamarpc.com', // Llama
  ],
  ANVIL: [
    'http://localhost:8545', // Default RPC
    'http://localhost:8545', // Public Node
    'http://localhost:8545', // Llama
  ],
  // TODO: double-check URLs are correct
  SEPOLIA: [
    'https://sepolia.base.org', // Default RPC
    'https://sepolia.base.org', // Public Node
    'https://sepolia.base.org', // Llama
  ],
} as const;

/**
 * Transport Configuration
 * @description Fallback configuration for RPC endpoints
 */
const transports = {
  [mainnet.id]: fallback(RPC_URLS.MAINNET.map((url) => http(url))),
  [arbitrum.id]: fallback(RPC_URLS.ARBITRUM.map((url) => http(url))),
  [base.id]: fallback(RPC_URLS.BASE.map((url) => http(url))),
  [31337]: fallback(RPC_URLS.ANVIL.map((url) => http(url))),
};

//const { wallets } = getDefaultWallets();
const wallets: WalletList = [
  //...getDefaultWallets().wallets,
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet,
      rainbowWallet,
      rabbyWallet,
      ledgerWallet,
      walletConnectWallet,
    ],
  },
  {
    groupName: 'Other Wallets',
    wallets: [
      phantomWallet,
      coinbaseWallet,
      coin98Wallet,
      trustWallet,
      uniswapWallet,
      injectedWallet,
      okxWallet,
      safeWallet,
    ],
  },
];

// TODO: use `sourceId` tricks from node_modules/viem/chains/definitions/base.ts
export const anvil = /*#__PURE__*/ defineChain({
	...chainConfig,
	id: 31337,
	name: 'Anvil',
	nativeCurrency: { name: 'Woot', symbol: 'WAT', decimals: 18 },
	rpcUrls: {
		default: {
			http: ['http://localhost:8545'],
		},
	},
	blockExplorers: {
		default: {
			name: 'Basescan',
			url: 'http://localhost:8545',
			apiUrl: 'http://localhost:8545',
		},
	},
	contracts: {
		IZorpFactory: {
			31337: {
				address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
				abi: IZorpFactory.abi,
			},
		},
		IZorpStudy: {
			31337: {
				address: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
				abi: IZorpStudy.abi,
			},
		},
		// ...chainConfig.contracts,
		// disputeGameFactory: {
		//   [sourceId]: {
		//     address: '0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e',
		//   },
		// },
		// l2OutputOracle: {
		//   [sourceId]: {
		//     address: '0x56315b90c40730925ec5485cf004d835058518A0',
		//   },
		// },
		// multicall3: {
		//   address: '0xca11bde05977b3631167028862be2a173976ca11',
		//   blockCreated: 5022,
		// },
		// portal: {
		//   [sourceId]: {
		//     address: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
		//     blockCreated: 17482143,
		//   },
		// },
		// l1StandardBridge: {
		//   [sourceId]: {
		//     address: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
		//     blockCreated: 17482143,
		//   },
		// },
	},
	sourceId: 31337,
});

/**
 * @see {@link https://docs.base.org/chain/network-information}
 * @see {@link https://1.x.wagmi.sh/react/chains}
 */
export const sepolia = /*#__PURE__*/ defineChain({
	...sepoliaDefaults,
	contracts: {
		IZorpFactory: {
			84532: {
				address: '0xD5B17B23c46a3514A2161Db8a405b0688a9d06cC',
				abi: IZorpFactory.abi,
			},
		},
		IZorpStudy: {
			84532: {
				// TODO: update `address` once a test study has been created
				address: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
				abi: IZorpStudy.abi,
			},
		},
	},
	sourceId: 84532,
});

export const wagmiConfig = getDefaultConfig({
  appName: 'Next dApp Template',
  projectId: projectId,
  wallets: wallets,
  chains: [
    mainnet,
    arbitrum,
    base,
    anvil,
    // TODO: re-enable `process` check after testing test-net
    sepolia,
    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  transports,
  ssr: true, // If your dApp uses server side rendering (SSR)
});
