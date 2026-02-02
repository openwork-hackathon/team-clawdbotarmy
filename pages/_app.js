import { useEffect } from 'react';
import { WalletProvider } from '../src/hooks/useWallet';

export default function App({ Component, pageProps }) {
  // Initialize background services on app start
  useEffect(() => {
    fetch('/api/init', { method: 'POST' })
      .then(res => res.json())
      .then(data => console.log('Services initialized:', data))
      .catch(err => console.error('Init failed:', err));
  }, []);

  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
