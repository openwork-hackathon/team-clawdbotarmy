/**
 * Global Application Layout
 * 
 * Wraps all pages with:
 * - WalletProvider: Manages MetaMask connection
 * - Navigation: Global top navigation menu
 * 
 * Navigation items are defined in NAV_ITEMS array below.
 * To add/remove links, edit this array.
 */

import { WalletProvider } from '../src/hooks/useWallet';
import Link from 'next/link';

/**
 * Navigation menu items
 * Format: { href, label, icon }
 * 
 * NOTE: When adding new pages, add them here for global navigation!
 */
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/arya', label: 'ARYA', icon: '🦞' },
  { href: '/bonding-curves', label: 'Trade', icon: '📈' },
  { href: '/staking', label: 'Staking', icon: '🔒' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
];

/**
 * Navigation Component
 * Sticky header with logo, links, and action buttons
 */
function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        {/* Brand/Logo */}
        <Link href="/" className="nav-brand">
          <span className="brand-emoji">🦞</span>
          <span className="brand-text">ClawdbotArmy</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
        
        {/* Action Buttons */}
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

/**
 * Main App Component
 * 
 * All pages are wrapped with:
 * - WalletProvider: Provides wallet context to all children
 * - Navigation: Visible on every page
 */
export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Navigation />
      <Component {...pageProps} />
    </WalletProvider>
  );
}
