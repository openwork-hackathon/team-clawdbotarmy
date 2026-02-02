import { useState, useEffect } from 'react';
import Head from 'next/head';


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
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="portfolio-page">
        <div className="portfolio-header">
          <h1>📊 Portfolio</h1>
          <div className="time-range-selector">
            {['24h', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Summary */}
        {portfolio && (
          <div className="portfolio-summary">
            <div className="summary-card total">
              <div className="summary-label">Total Portfolio Value</div>
              <div className="summary-value">{formatCurrency(portfolio.totalValue)}</div>
              <div className="summary-change" style={{ color: getPnLColor(portfolio.dailyPercent) }}>
                {formatPercent(portfolio.dailyPercent)} today
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-label">Total PnL</div>
              <div className="summary-value" style={{ color: getPnLColor(portfolio.pnlPercent) }}>
                {formatCurrency(portfolio.totalPnL)}
              </div>
              <div className="summary-change" style={{ color: getPnLColor(portfolio.pnlPercent) }}>
                {formatPercent(portfolio.pnlPercent)}
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-label">Best Performer</div>
              <div className="summary-value" style={{ color: '#10b981' }}>
                {portfolio.bestPerformer.token}
              </div>
              <div className="summary-change positive">
                +{portfolio.bestPerformer.pnl}%
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-label">Worst Performer</div>
              <div className="summary-value" style={{ color: '#ef4444' }}>
                {portfolio.worstPerformer.token}
              </div>
              <div className="summary-change negative">
                {portfolio.worstPerformer.pnl}%
              </div>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="holdings-section">
          <h2>Holdings</h2>
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>Holdings</th>
                <th>Value</th>
                <th>PnL</th>
                <th>Alloc</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(holding => (
                <tr key={holding.token}>
                  <td>
                    <span className="token-name">
                      {holding.token === 'ARYA' ? '🦞' :
                       holding.token === 'OPENWORK' ? '⚡' :
                       holding.token === 'ETH' ? 'Ξ' :
                       holding.token === 'BTC' ? '₿' :
                       holding.token === 'SOL' ? '◎' : '$'}
                    </span>
                    <span style={{ marginLeft: '10px' }}>{holding.token}</span>
                  </td>
                  <td>{formatCurrency(holding.price)}</td>
                  <td className="token-amount">{holding.amount.toLocaleString()}</td>
                  <td>{formatCurrency(holding.value)}</td>
                  <td className={`pnl ${holding.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(holding.pnl)}
                  </td>
                  <td>{holding.allocation}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Allocation Bar */}
          <div className="allocation-bar">
            {holdings.map((h, i) => (
              <div 
                key={h.token}
                className="allocation-segment"
                style={{ 
                  width: `${h.allocation}%`,
                  background: h.token === 'ARYA' ? '#ff6b35' : 
                             h.token === 'ETH' ? '#627eea' : 
                             h.token === 'BTC' ? '#f7931a' : 
                             h.token === 'SOL' ? '#9945ff' : 
                             h.token === 'OPENWORK' ? '#00d4ff' : '#9ca3af'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* PnL Chart */}
        <div className="pnl-chart">
          <h2>PnL History ({timeRange})</h2>
          <div className="chart-container">
            {history.map((point, i) => {
              const minVal = Math.min(...history.map(h => h.value));
              const maxVal = Math.max(...history.map(h => h.value));
              const range = maxVal - minVal || 1;
              const height = ((point.value - minVal) / range) * 150 + 20;
              
              return (
                <div 
                  key={i}
                  className="chart-bar"
                  style={{ height: `${height}px` }}
                  title={`${new Date(point.time).toLocaleDateString()}: ${formatCurrency(point.value)}`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
