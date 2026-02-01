import { WalletProvider } from '../src/hooks/useWallet';

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
