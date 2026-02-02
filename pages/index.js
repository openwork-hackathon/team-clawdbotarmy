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
import { useState, useEffect } from 'react';

// Live prices component
function LivePrices() {
  const [prices, setPrices] = useState(null);
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        const data = await r.json();
        setPrices(data);
      } catch (e) {
        console.error('Error fetching prices:', e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!prices) return <span style={{fontSize: '0.75em', color: 'var(--text-secondary)'}}>Loading prices...</span>;
  
  return (
    <div style={{display: 'flex', gap: '15px', fontSize: '0.85em', marginTop: '5px'}}>
      <span style={{color: '#f7931a'}}>BTC ${prices.bitcoin?.usd?.toLocaleString()}</span>
      <span style={{color: '#627eea'}}>ETH ${prices.ethereum?.usd?.toLocaleString()}</span>
      <span style={{color: '#9945ff'}}>SOL ${prices.solana?.usd?.toLocaleString()}</span>
    </div>
  );
}

// Disable static pre-rendering for wallet-dependent page
export const dynamic = 'force-dynamic';

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [timeframe, setTimeframe] = useState('1h');

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
  };

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
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '1.8em' }}>🦞</span>
            <div>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '1.3em',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-green))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>ClawdbotArmy</span>
              <LivePrices />
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/bonding-curves" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>📈 Bonding Curves</a>
            <a href="/staking" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>🔒 Staking</a>
            <a href="/portfolio" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>📊 Portfolio</a>
            <a href="/arya" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>🦞 ARYA</a>
            <a href="/openwork" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: '600' }}>⚡ OPENWORK</a>
            <a 
              href="https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #ff0055, #ff00aa)',
                color: '#fff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.85em',
                boxShadow: '0 4px 15px rgba(255, 0, 85, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '10px'
              }}
            >
              <span>🦄</span>
              <span>Buy 🦞 ARYA</span>
            </a>
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
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Coin Selector */}
                  <select 
                    value={selectedCoin} 
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--bg-secondary)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="bitcoin">BTC</option>
                    <option value="ethereum">ETH</option>
                    <option value="solana">SOL</option>
                    <option value="pepe">PEPE</option>
                    <option value="bonk">BONK</option>
                  </select>
                </div>
              </div>
              
              {/* Price Chart with Timeframes */}
              <PriceChart 
                coinId={selectedCoin} 
                days={7} 
                timeframe={timeframe}
                onTimeframeChange={handleTimeframeChange}
              />
            </div>
            
            <div className="orderbook-section">
              <OrderBook symbol={selectedCoin.toUpperCase()} />
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

          {/* Team Section */}
          <section style={{ 
            marginTop: '40px',
            padding: '30px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px'
          }}>
            <h2 style={{ marginBottom: '20px' }}>🤖 Team ClawdbotArmy</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-card)', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🦞</div>
                <h3 style={{ margin: '0 0 5px' }}>Arya</h3>
                <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85em' }}>PM & Trading</p>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-card)', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🩸</div>
                <h3 style={{ margin: '0 0 5px' }}>Bloody</h3>
                <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85em' }}>Backend & APIs</p>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-card)', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🧠</div>
                <h3 style={{ margin: '0 0 5px' }}>Ydoolb</h3>
                <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85em' }}>Research & Docs</p>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-card)', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>💨</div>
                <h3 style={{ margin: '0 0 5px' }}>Zephyr</h3>
                <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85em' }}>UI Enhancement</p>
              </div>
            </div>
            <p style={{ 
              textAlign: 'center', 
              marginTop: '20px', 
              color: 'var(--text-secondary)',
              fontSize: '0.9em'
            }}>
              🏆 Competing in OpenWork Clawathon 2026
            </p>
          </section>

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
<!-- deploy 1770045594 -->
