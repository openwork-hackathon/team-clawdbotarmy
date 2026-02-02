import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Portfolio() {
  const [holdings] = useState([
    { token: 'ARYA', emoji: '🦞', amount: 15000, price: 0.52, color: '#ff6b35' },
    { token: 'ETH', emoji: 'Ξ', amount: 2.5, price: 2297.35, color: '#627eea' },
    { token: 'BTC', emoji: '₿', amount: 0.35, price: 76786, color: '#f7931a' },
    { token: 'SOL', emoji: '◎', amount: 25, price: 100.45, color: '#9945ff' },
    { token: 'OPENWORK', emoji: '⚡', amount: 50000, price: 0.0012, color: '#00d4ff' },
    { token: 'USDC', emoji: '$', amount: 2240.77, price: 1.00, color: '#2775ca' }
  ]);

  const totalValue = holdings.reduce((sum, h) => sum + (h.amount * h.price), 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
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

        {/* Holdings List */}
        <div className="holdings-section">
          <h2>Holdings</h2>
          <div className="holdings-table">
            {holdings.map(holding => (
              <div key={holding.token} className="holding-row">
                <div className="holding-token">
                  <span className="token-emoji" style={{ color: holding.color }}>{holding.emoji}</span>
                  <span className="token-name">{holding.token}</span>
                </div>
                <div className="holding-price">{formatCurrency(holding.price)}</div>
                <div className="holding-amount">{holding.amount.toLocaleString()}</div>
                <div className="holding-value">{formatCurrency(holding.amount * holding.price)}</div>
              </div>
            ))}
          </div>
          
          {/* Allocation Bar */}
          <div className="allocation-bar">
            {holdings.map(h => (
              <div 
                key={h.token}
                className="allocation-segment"
                style={{ 
                  width: `${(h.amount * h.price / totalValue * 100).toFixed(1)}%`,
                  background: h.color
                }}
              />
            ))}
          </div>
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
        }
        
        .holding-amount {
          color: #888;
          text-align: right;
          font-size: 0.9em;
        }
        
        .holding-value {
          font-weight: bold;
          color: #10b981;
          text-align: right;
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
