import { useState } from 'react';

export default function TradeHistory() {
  const [trades] = useState([
    { id: 1, time: '20:15:32', symbol: 'BTC', side: 'BUY', price: 78234.50, amount: 0.05, total: 3911.73 },
    { id: 2, time: '20:14:18', symbol: 'ETH', side: 'SELL', price: 2415.30, amount: 0.5, total: 1207.65 },
    { id: 3, time: '20:12:45', symbol: 'SOL', side: 'BUY', price: 104.80, amount: 10, total: 1048.00 },
    { id: 4, time: '20:10:22', symbol: 'BTC', side: 'SELL', price: 78100.00, amount: 0.02, total: 1562.00 },
    { id: 5, time: '20:08:55', symbol: 'ETH', side: 'BUY', price: 2398.50, amount: 0.3, total: 719.55 },
    { id: 6, time: '20:05:12', symbol: 'SOL', side: 'SELL', price: 106.20, amount: 5, total: 531.00 },
    { id: 7, time: '20:02:08', symbol: 'BTC', side: 'BUY', price: 77950.00, amount: 0.1, total: 7795.00 },
    { id: 8, time: '19:58:33', symbol: 'ETH', side: 'BUY', price: 2385.00, amount: 0.2, total: 477.00 },
  ]);

  return (
    <div className="trade-history">
      <div className="history-header">
        <h4>📜 Recent Trades</h4>
        <div className="history-filters">
          <button className="filter active">All</button>
          <button className="filter">Buy</button>
          <button className="filter">Sell</button>
        </div>
      </div>

      <div className="history-table">
        <div className="history-row header">
          <span>Time</span>
          <span>Symbol</span>
          <span>Side</span>
          <span>Price</span>
          <span>Amount</span>
          <span>Total</span>
        </div>
        
        <div className="history-body">
          {trades.map(trade => (
            <div key={trade.id} className={`history-row ${trade.side.toLowerCase()}`}>
              <span className="trade-time">{trade.time}</span>
              <span className="trade-symbol">{trade.symbol}</span>
              <span className={`trade-side ${trade.side.toLowerCase()}`}>{trade.side}</span>
              <span className="trade-price">${trade.price.toLocaleString()}</span>
              <span className="trade-amount">{trade.amount} {trade.symbol}</span>
              <span className="trade-total">${trade.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="history-summary">
        <div className="summary-item">
          <span>Total Buys:</span>
          <span className="buy-total">$7,903.28</span>
        </div>
        <div className="summary-item">
          <span>Total Sells:</span>
          <span className="sell-total">$3,300.65</span>
        </div>
        <div className="summary-item">
          <span>Net Volume:</span>
          <span className="net-volume">$11,203.93</span>
        </div>
      </div>
    </div>
  );
}
