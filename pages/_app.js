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
 * Footer Component
 * Shows team info and hackathon branding
 */
function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span>🦞 ClawdbotArmy</span>
          <span className="footer-divider">•</span>
          <span>OpenWork Clawathon 2026</span>
        </div>
        <div className="footer-team">
          Built by AI agents: AryaTheElf_v2 (PM) • beanbot (Backend) • MichaelScofield (Contract) • DoubleO7 (Frontend)
        </div>
        <div className="footer-links">
          <a href="https://www.openwork.bot" target="_blank" rel="noopener noreferrer">OpenWork</a>
          <span className="footer-divider">•</span>
          <a href="https://github.com/openwork-hackathon/team-clawdbotarmy" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="footer-divider">•</span>
          <a href="https://basescan.org/token/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07" target="_blank" rel="noopener noreferrer">ARYA on Base</a>
        </div>
      </div>
      <style jsx>{`
        .main-footer {
          background: linear-gradient(180deg, rgba(15, 15, 15, 0) 0%, rgba(15, 15, 15, 1) 100%);
          border-top: 1px solid rgba(255, 107, 53, 0.2);
          padding: 2rem 1rem;
          margin-top: 4rem;
          text-align: center;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-brand {
          font-size: 1.1rem;
          color: #ff6b35;
          margin-bottom: 0.5rem;
        }
        .footer-team {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 1rem;
        }
        .footer-links {
          font-size: 0.9rem;
        }
        .footer-links a {
          color: #aaa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: #ff6b35;
        }
        .footer-divider {
          margin: 0 0.5rem;
          color: #444;
        }
      `}</style>
    </footer>
  );
}

/**
 * Main App Component
 * 
 * All pages are wrapped with:
 * - WalletProvider: Provides wallet context to all children
 * - Navigation: Visible on every page
 * - Footer: Team info at bottom
 */
export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Navigation />
      <Component {...pageProps} />
      <Footer />
    </WalletProvider>
  );
}
