import { metadata } from '@/app/metadata';
import Layout from '@/layout';
import Providers from '@/providers/AppProviders';
import '@/assets/styles/globals.scss';
import '@rainbow-me/rainbowkit/styles.css';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-offCream text-offBlack font-sf-pro">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
