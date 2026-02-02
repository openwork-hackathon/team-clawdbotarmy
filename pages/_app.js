import { WalletProvider } from '../src/hooks/useWallet';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: '🏠 Home', icon: '🏠' },
  { href: '/arya', label: '🦞 ARYA', icon: '🦞' },
  { href: '/bonding-curves', label: '📈 Trade', icon: '📈' },
  { href: '/staking', label: '🔒 Staking', icon: '🔒' },
  { href: '/portfolio', label: '💼 Portfolio', icon: '💼' },
];

function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <span className="brand-emoji">🦞</span>
          <span className="brand-text">ClawdbotArmy</span>
        </Link>
        
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="nav-actions">
          <a 
            href="https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-btn nav-btn-primary"
          >
            🦄 Buy ARYA
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Navigation />
      <Component {...pageProps} />
    </WalletProvider>
  );
}
