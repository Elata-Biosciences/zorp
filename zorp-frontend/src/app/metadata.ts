import type { Metadata, Viewport } from 'next';

const DOMAIN = 'zorp.elata.bio';

const siteConfig = {
  title: 'ZORP Onchain Research Protocol',
  description:
    'Privacy-preserving data collection and reward distribution platform. Submit research data pseudonymously while earning ETH rewards through transparent, decentralized smart contracts.',
  keywords:
    'Blockchain Research, Data Collection, Privacy, Ethereum, Smart Contracts, EEG, Surveys, Research Protocol, Decentralized Science, DeSci, GPG Encryption, IPFS, Reward Distribution',
  author: 'Elata Biosciences',
  url: DOMAIN,
  image: `${DOMAIN}/img/logo.png`,
} as const;

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(`https://${DOMAIN}`),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  manifest: '/site.webmanifest',
  icons: {
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: siteConfig.image }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.image],
  },
} as const;
