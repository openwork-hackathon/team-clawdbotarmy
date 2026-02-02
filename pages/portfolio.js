import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default portfolio for display
  const defaultHoldings = [
    { token: 'ARYA', emoji: '🦞', amount: 15000, price: 0.00001, color: '#ff6b35', value: 0.15 },
    { token: 'ETH', emoji: 'Ξ', amount: 2.5, price: 2297.35, color: '#627eea', value: 5743.38 },
    { token: 'BTC', emoji: '₿', amount: 0.35, price: 76786, color: '#f7931a', value: 26875.10 },
    { token: 'SOL', emoji: '◎', amount: 25, price: 100.45, color: '#9945ff', value: 2511.25 },
    { token: 'KROWNEPO', emoji: '👑', amount: 1000000, price: 0.000001, color: '#9333ea', value: 1.00 },
    { token: 'OPENWORK', emoji: '⚡', amount: 50000, price: 0.00001, color: '#00d4ff', value: 0.50 },
    { token: 'USDC', emoji: '$', amount: 2240.77, price: 1.00, color: '#2775ca', value: 2240.77 }
  ];

  const displayHoldings = holdings.length > 0 ? holdings : defaultHoldings;
  const totalValue = displayHoldings.reduce((sum, h) => sum + (h.value || 0), 0);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatAmount = (amount, token) => {
    if (token === 'BTC' || token === 'WBTC') return amount.toFixed(4);
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <>
      <Head>
        <title>📊 Portfolio | ClawdbotArmy</title>
        <meta name="description" content="Track your crypto portfolio" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="portfolio-page">
        <header className="portfolio-header">
          <h1>📊 Portfolio</h1>
          <div className="total-value">{formatCurrency(totalValue)}</div>
        </header>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="holdings-section">
          <h2>Holdings</h2>
          <div className="holdings-table">
            {displayHoldings.map(holding => (
              <div key={holding.token} className="holding-row">
                <div className="holding-token">
                  <span className="token-emoji" style={{ color: holding.color }}>{holding.emoji}</span>
                  <span className="token-name">{holding.token}</span>
                </div>
                <div className="holding-price">{formatCurrency(holding.price || 0)}</div>
                <div className="holding-amount">{formatAmount(holding.amount, holding.token)}</div>
                <div className="holding-value">{formatCurrency(holding.value || 0)}</div>
              </div>
            ))}
          </div>
          
          {totalValue > 0 && (
            <div className="allocation-bar">
              {displayHoldings.map(h => {
                const percentage = ((h.value || 0) / totalValue * 100).toFixed(1);
                return percentage > 0 ? (
                  <div 
                    key={h.token}
                    className="allocation-segment"
                    style={{ 
                      width: `${percentage}%`,
                      background: h.color,
                      minWidth: percentage > 1 ? '4px' : '0px'
                    }}
                    title={`${h.token}: ${percentage}%`}
                  />
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .portfolio-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #151520 100%);
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .portfolio-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .portfolio-header h1 {
          font-size: 2em;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .total-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #10b981;
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          color: #ef4444;
          text-align: center;
        }
        
        .holdings-section {
          background: linear-gradient(135deg, #1a1a24 0%, #151520 100%);
          border-radius: 20px;
          padding: 25px;
          border: 1px solid #2a2a3a;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .holdings-section h2 {
          margin: 0 0 20px 0;
          font-size: 1.2em;
          color: #888;
        }
        
        .holdings-table {
          display: flex;
          flex-direction: column;
        }
        
        .holding-row {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #2a2a3a;
          align-items: center;
        }
        
        .holding-row:last-child {
          border-bottom: none;
        }
        
        .holding-token {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .token-emoji {
          font-size: 1.3em;
        }
        
        .token-name {
          font-weight: 600;
          color: #fff;
        }
        
        .holding-price {
          color: #888;
          font-size: 0.9em;
          min-width: 80px;
          text-align: right;
        }
        
        .holding-amount {
          color: #888;
          text-align: right;
          font-size: 0.9em;
          min-width: 70px;
        }
        
        .holding-value {
          font-weight: bold;
          color: #10b981;
          text-align: right;
          min-width: 90px;
        }
        
        .allocation-bar {
          display: flex;
          height: 8px;
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 20px;
        }
        
        .allocation-segment {
          height: 100%;
          transition: width 0.3s;
        }
      `}</style>
    </>
  );
}
