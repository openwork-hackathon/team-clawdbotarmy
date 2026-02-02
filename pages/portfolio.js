import { useState, useEffect } from 'react';
import Head from 'next/head';

// Enable dynamic rendering
export const dynamic = 'force-dynamic';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [history, setHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      // Simulated portfolio data
      setPortfolio({
        totalValue: 45230.50,
        totalPnL: 3245.75,
        pnlPercent: 7.73,
        dailyChange: -1250.20,
        dailyPercent: -2.69,
        bestPerformer: { token: 'ARYA', pnl: 45.2 },
        worstPerformer: { token: 'SOL', pnl: -8.5 }
      });

      setHoldings([
        { token: 'ARYA', amount: 15000, price: 0.52, value: 7800, pnl: 45.2, allocation: 17.2 },
        { token: 'ETH', amount: 2.5, price: 2297.35, value: 5743.38, pnl: 12.4, allocation: 12.7 },
        { token: 'BTC', amount: 0.35, price: 76786, value: 26875.10, pnl: 8.2, allocation: 59.4 },
        { token: 'SOL', amount: 25, price: 100.45, value: 2511.25, pnl: -8.5, allocation: 5.6 },
        { token: 'OPENWORK', amount: 50000, price: 0.0012, value: 60, pnl: 20, allocation: 0.1 },
        { token: 'USDC', amount: 2240.77, price: 1.00, value: 2240.77, pnl: 0, allocation: 5.0 }
      ]);

      // Generate PnL history for chart
      const historyData = [];
      let baseValue = 42000;
      const now = Date.now();
      const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = points; i >= 0; i--) {
        const volatility = (Math.random() - 0.5) * 1000;
        baseValue += volatility + (Math.random() * 200);
        historyData.push({
          time: now - (i * (timeRange === '24h' ? 3600000 : 86400000)),
          value: baseValue
        });
      }
      setHistory(historyData);
    } catch (e) {
      console.error('Error fetching portfolio:', e);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPnLColor = (value) => {
    if (value > 0) return '#10b981';
    if (value < 0) return '#ef4444';
    return '#9ca3af';
  };

  // Simple SVG chart
  const renderChart = () => {
    if (history.length < 2) return null;
    
    const minValue = Math.min(...history.map(d => d.value));
    const maxValue = Math.max(...history.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const width = 100;
    const height = 40;
    
    const points = history.map((d, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((d.value - minValue) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = history[history.length - 1].value >= history[0].value;
    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const fillGradient = isPositive 
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          fill="url(#areaGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <>
      <Head>
        <title>📊 Portfolio | ClawdbotArmy</title>
        <meta name="description" content="Track your portfolio performance and PnL" />
      </Head>
      
      <div className="portfolio-page">
        <div className="portfolio-header">
          <h1>📊 Portfolio</h1>
          <p>Track your holdings and performance</p>
        </div>

        {/* Portfolio Summary */}
        {portfolio && (
          <div className="portfolio-summary">
            <div className="total-value">
              <span className="label">Total Portfolio Value</span>
              <span className="value">{formatCurrency(portfolio.totalValue)}</span>
              <div className="changes">
                <span className="pnl" style={{ color: getPnLColor(portfolio.pnlPercent) }}>
                  {formatPercent(portfolio.pnlPercent)} all time
                </span>
                <span className="daily" style={{ color: getPnLColor(portfolio.dailyPercent) }}>
                  {formatPercent(portfolio.dailyPercent)} today
                </span>
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="mini-chart">
              {renderChart()}
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="time-selector">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              className={timeRange === range ? 'active' : ''}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Holdings Table */}
        <div className="holdings-section">
          <h3>Holdings</h3>
          <div className="holdings-table">
            <div className="table-header">
              <span>Asset</span>
              <span>Price</span>
              <span>Holdings</span>
              <span>Value</span>
              <span>PnL</span>
              <span>Alloc</span>
            </div>
            {holdings.map(holding => (
              <div key={holding.token} className="table-row">
                <div className="asset">
                  <span className="token-emoji">
                    {holding.token === 'ARYA' ? '🦞' :
                     holding.token === 'OPENWORK' ? '⚡' :
                     holding.token === 'ETH' ? 'Ξ' :
                     holding.token === 'BTC' ? '₿' :
                     holding.token === 'SOL' ? '◎' : '$'}
                  </span>
                  <span className="token-name">{holding.token}</span>
                </div>
                <span className="price">{formatCurrency(holding.price)}</span>
                <span className="amount">{holding.amount.toLocaleString()}</span>
                <span className="value">{formatCurrency(holding.value)}</span>
                <span className="pnl" style={{ color: getPnLColor(holding.pnl) }}>
                  {formatPercent(holding.pnl)}
                </span>
                <span className="allocation">{holding.allocation}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        {portfolio && (
          <div className="performance-stats">
            <div className="stat-card">
              <span className="stat-label">Best Performer</span>
              <span className="stat-value" style={{ color: '#10b981' }}>
                {portfolio.bestPerformer.token} ({formatPercent(portfolio.bestPerformer.pnl)})
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Worst Performer</span>
              <span className="stat-value" style={{ color: '#ef4444' }}>
                {portfolio.worstPerformer.token} ({formatPercent(portfolio.worstPerformer.pnl)})
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total PnL</span>
              <span className="stat-value" style={{ color: getPnLColor(portfolio.pnlPercent) }}>
                {formatCurrency(portfolio.totalPnL)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Daily Change</span>
              <span className="stat-value" style={{ color: getPnLColor(portfolio.dailyPercent) }}>
                {formatCurrency(portfolio.dailyChange)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="portfolio-actions">
          <button className="action-btn deposit">
            💰 Deposit
          </button>
          <button className="action-btn withdraw">
            💸 Withdraw
          </button>
          <button className="action-btn transfer">
            🔄 Transfer
          </button>
          <button className="action-btn export">
            📋 Export
          </button>
        </div>
      </div>

      <style jsx>{`
        .portfolio-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .portfolio-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .portfolio-header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        
        .portfolio-header p {
          color: #9ca3af;
        }
        
        .portfolio-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .total-value .label {
          display: block;
          color: #9ca3af;
          margin-bottom: 5px;
        }
        
        .total-value .value {
          font-size: 2.5em;
          font-weight: bold;
          display: block;
        }
        
        .changes {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }
        
        .changes span {
          font-size: 1em;
          font-weight: 500;
        }
        
        .mini-chart {
          width: 200px;
          height: 80px;
        }
        
        .mini-chart :global(.chart-svg) {
          width: 100%;
          height: 100%;
        }
        
        .time-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }
        
        .time-selector button {
          padding: 10px 20px;
          border: 2px solid #333;
          border-radius: 8px;
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .time-selector button.active {
          background: #6366f1;
          border-color: #6366f1;
        }
        
        .holdings-section {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
        }
        
        .holdings-section h3 {
          margin-bottom: 20px;
        }
        
        .holdings-table {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
          gap: 10px;
          padding: 12px;
          align-items: center;
        }
        
        .table-header {
          color: #9ca3af;
          font-size: 0.85em;
          text-transform: uppercase;
        }
        
        .table-row {
          background: #2a2a2a;
          border-radius: 10px;
        }
        
        .asset {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .token-emoji {
          font-size: 1.5em;
        }
        
        .token-name {
          font-weight: bold;
        }
        
        .price, .amount, .value, .pnl, .allocation {
          text-align: right;
        }
        
        .performance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: #1e1e1e;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        
        .stat-label {
          display: block;
          color: #9ca3af;
          font-size: 0.85em;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 1.3em;
          font-weight: bold;
        }
        
        .portfolio-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 15px 30px;
          border: 2px solid #333;
          border-radius: 12px;
          background: transparent;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .action-btn:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }
        
        @media (max-width: 768px) {
          .portfolio-page {
            padding: 15px;
          }
          
          .portfolio-summary {
            flex-direction: column;
            text-align: center;
          }
          
          .total-value .value {
            font-size: 2em;
          }
          
          .table-header, .table-row {
            grid-template-columns: 1.5fr 1fr 1fr 1fr;
          }
          
          .table-header span:nth-child(2),
          .table-row .price,
          .table-header span:nth-child(6),
          .table-row .allocation {
            display: none;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
