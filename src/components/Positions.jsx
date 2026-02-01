import { useState } from 'react';

export default function Positions() {
  const [positions, setPositions] = useState([
    { symbol: 'BTC', side: 'LONG', entryPrice: 75200, amount: 0.05, leverage: 2, pnl: 140, pnlPercent: 3.7 },
    { symbol: 'ETH', side: 'LONG', entryPrice: 2350, amount: 0.5, leverage: 1, pnl: 25, pnlPercent: 2.1 },
    { symbol: 'SOL', side: 'SHORT', entryPrice: 108, amount: 10, leverage: 1.5, pnl: -30, pnlPercent: -2.8 },
  ]);

  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalValue = positions.reduce((sum, p) => sum + (p.amount * 78000), 0);

  return (
    <div className="positions-panel">
      <div className="positions-header">
        <h3>📈 Positions</h3>
        <div className="positions-summary">
          <span className="total-pnl" style={{ color: totalPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} PnL
          </span>
          <span className="total-value">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="positions-list">
        {positions.map((pos, i) => (
          <div key={i} className={`position-row ${pos.pnl >= 0 ? 'profit' : 'loss'}`}>
            <div className="pos-main">
              <div className="pos-symbol">
                <span className={`side-badge ${pos.side.toLowerCase()}`}>{pos.side}</span>
                <span className="symbol">{pos.symbol}</span>
              </div>
              <div className="pos-size">
                <span className="size">{pos.amount} {pos.symbol}</span>
                <span className="leverage">{pos.leverage}x</span>
              </div>
            </div>
            
            <div className="pos-prices">
              <div className="price-entry">
                <span className="label">Entry</span>
                <span className="value">${pos.entryPrice.toLocaleString()}</span>
              </div>
              <div className="price-mark">
                <span className="label">Mark</span>
                <span className="value">${(pos.entryPrice * (pos.pnl >= 0 ? 1.02 : 0.97)).toLocaleString()}</span>
              </div>
              <div className="price-liqq">
                <span className="label">Liq. Price</span>
                <span className="value">${(pos.entryPrice * (pos.side === 'LONG' ? 0.85 : 1.15)).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="pos-pnl">
              <span className={`pnl-value ${pos.pnl >= 0 ? 'up' : 'down'}`}>
                {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
              </span>
              <span className={`pnl-percent ${pos.pnl >= 0 ? 'up' : 'down'}`}>
                {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
              </span>
            </div>
            
            <div className="pos-actions">
              <button className="close-btn">Close</button>
              <button className="tp-btn">TP</button>
              <button className="sl-btn">SL</button>
            </div>
          </div>
        ))}
      </div>

      <div className="positions-footer">
        <button className="add-position">+ Add Position</button>
        <button className="close-all">Close All</button>
      </div>
    </div>
  );
}
