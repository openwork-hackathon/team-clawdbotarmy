import Head from 'next/head';
import Dashboard from '../src/components/Dashboard';
import Portfolio from '../src/components/Portfolio';
import PriceChart from '../src/components/PriceChart';
import TradingPanel from '../src/components/TradingPanel';
import MarketOverview from '../src/components/MarketOverview';
import Positions from '../src/components/Positions';
import OrderBook from '../src/components/OrderBook';
import TradeHistory from '../src/components/TradeHistory';
import WalletConnect from '../src/components/WalletConnect';

// Disable static pre-rendering for wallet-dependent page
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Head>
        <title>🦞 ClawdbotArmy - Crypto Trading Platform</title>
        <meta name="description" content="AI Agent Crypto Trading & Analysis Platform" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="container">
        <header className="main-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '15px 30px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5em' }}>🦞</span>
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '1.2em',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-green))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>ClawdbotArmy</span>
          </div>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="/bonding-curves" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Bonding Curves</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Trade</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Portfolio</a>
            <div style={{ marginLeft: '10px' }}>
              <WalletConnect />
            </div>
            <a href="https://github.com/openwork-hackathon/team-clawdbotarmy" 
               style={{ 
                 padding: '8px 16px',
                 background: 'var(--accent)',
                 color: '#000',
                 borderRadius: '20px',
                 textDecoration: 'none',
                 fontWeight: 'bold',
                 fontSize: '0.9em'
               }}>
              GitHub
            </a>
          </nav>
        </header>

        <main>
          {/* Market Overview */}
          <MarketOverview />

          {/* Main Trading Section */}
          <div className="trading-grid">
            <div className="chart-section">
              <div className="section-header">
                <h2>📈 BTC/USDT</h2>
                <div className="timeframe-selector">
                  <button className="tf active">1H</button>
                  <button className="tf">4H</button>
                  <button className="tf">1D</button>
                  <button className="tf">1W</button>
                </div>
              </div>
              <PriceChart coinId="bitcoin" days={7} />
            </div>
            
            <div className="orderbook-section">
              <OrderBook symbol="BTC" />
            </div>
          </div>

          {/* Trading Panel & History */}
          <div className="lower-grid">
            <div className="trade-section">
              <TradingPanel />
            </div>
            <div className="history-section">
              <TradeHistory />
            </div>
          </div>

          {/* Signals & Positions */}
          <div className="signals-positions-grid">
            <div className="signals-section">
              <h2>📊 Trading Signals</h2>
              <Dashboard />
            </div>
            <div className="positions-section">
              <Positions />
            </div>
          </div>

          {/* Portfolio */}
          <section>
            <Portfolio />
          </section>
        </main>

        <footer style={{ 
          textAlign: 'center', 
          padding: '30px 0', 
          marginTop: '30px',
          borderTop: '1px solid var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          <p>🦞 Built by AI agents during OpenWork Clawathon 2026</p>
          <p style={{ fontSize: '0.85em', marginTop: '8px' }}>
            Powered by CoinGecko API + Technical Analysis
          </p>
        </footer>
      </div>
    </>
  );
}
