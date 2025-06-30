import '@rainbow-me/rainbowkit/styles.css';
import { defineChain } from 'viem';
import { chainConfig } from 'viem/op-stack';
import { http, fallback } from 'wagmi';
import { arbitrum, base, mainnet, sepolia as ethereumSepolia } from 'wagmi/chains';
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
  ETHEREUM_SEPOLIA: [
    'https://eth-sepolia.g.alchemy.com/v2/demo', // Alchemy
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Infura
    'https://rpc.ankr.com/eth_sepolia', // Ankr
  ],
  BASE_SEPOLIA: [
    'https://sepolia.base.org', // Base official
    'https://base-sepolia.blockpi.network/v1/rpc/public', // BlockPI
    'https://base-sepolia-rpc.publicnode.com', // PublicNode
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
  [ethereumSepolia.id]: fallback(RPC_URLS.ETHEREUM_SEPOLIA.map((url) => http(url))),
  [84532]: fallback(RPC_URLS.BASE_SEPOLIA.map((url) => http(url))),
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
	},
	sourceId: 31337,
});

/**
 * Ethereum Sepolia - Standard Ethereum testnet
 */
export const ethereumSepoliaWithContracts = /*#__PURE__*/ defineChain({
	...ethereumSepolia,
	contracts: {
		IZorpFactory: {
			[ethereumSepolia.id]: {
				address: '0xD5B17B23c46a3514A2161Db8a405b0688a9d06cC',
				abi: IZorpFactory.abi,
			},
		},
		IZorpStudy: {
			[ethereumSepolia.id]: {
				address: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
				abi: IZorpStudy.abi,
			},
		},
	},
});

/**
 * Base Sepolia - Base L2 testnet
 * @see {@link https://docs.base.org/network-information}
 */
export const baseSepolia = /*#__PURE__*/ defineChain({
	...chainConfig,
	id: 84532,
	name: 'Base Sepolia',
	nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
	rpcUrls: {
		default: {
			http: ['https://sepolia.base.org'],
		},
	},
	blockExplorers: {
		default: {
			name: 'BaseScan',
			url: 'https://sepolia.basescan.org',
			apiUrl: 'https://api-sepolia.basescan.org/api',
		},
	},
	contracts: {
		IZorpFactory: {
			84532: {
				address: '0xD5B17B23c46a3514A2161Db8a405b0688a9d06cC',
				abi: IZorpFactory.abi,
			},
		},
		IZorpStudy: {
			84532: {
				address: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
				abi: IZorpStudy.abi,
			},
		},
	},
	sourceId: 84532,
});

export const wagmiConfig = getDefaultConfig({
  appName: 'ZORP Onchain Research Protocol',
  projectId: projectId,
  wallets: wallets,
  chains: [
    mainnet,
    arbitrum,
    base,
    anvil,
    ethereumSepoliaWithContracts,
    baseSepolia,
    // Both Sepolia networks are now properly supported
  ],
  transports,
  ssr: true, // If your dApp uses server side rendering (SSR)
});
