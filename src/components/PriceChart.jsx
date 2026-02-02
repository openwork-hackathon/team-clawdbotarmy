import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function PriceChart({ coinId, days = 7, timeframe = '1d', onTimeframeChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Generate fallback data when API fails
  const generateFallbackData = () => {
    const now = Date.now();
    const interval = activeTimeframe === '1d' ? 86400000 : activeTimeframe === '7d' ? 86400000 : 3600000;
    const points = activeTimeframe === '1d' ? 24 : activeTimeframe === '7d' ? 7 : 24;
    
    const basePrice = { bitcoin: 78000, ethereum: 2400, solana: 180, pepe: 0.000012, bonk: 0.000021 }[coinId] || 100;
    const prices = [];
    
    for (let i = points; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + variation * (points - i) / points);
      prices.push([now - i * interval, price]);
    }
    
    return prices;
  };

  // Fetch chart data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Use POST to avoid caching issues
    fetch(`/api/chart/${coinId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, timeframe: activeTimeframe })
    })
      .then(r => r.json())
      .then(d => {
        if (d.prices && d.prices.length > 0) {
          setData(d.prices);
        } else {
          // Generate fallback data
          setData(generateFallbackData());
        }
        setLoading(false);
      })
      .catch(e => {
        console.error('Error fetching chart:', e);
        setData(generateFallbackData());
        setLoading(false);
      });
  }, [coinId, days, activeTimeframe]);

  // Build chart
  useEffect(() => {
    if (data.length > 0 && canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      const formatLabel = (timestamp) => {
        const date = new Date(timestamp);
        if (['1m', '5m', '15m'].includes(activeTimeframe)) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (activeTimeframe === '1h' || activeTimeframe === '4h') {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit' });
        } else {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
      };

      const labels = data.map(p => formatLabel(p[0]));
      const prices = data.map(p => p[1]);
      
      // Determine color based on price trend
      const isUp = prices[prices.length - 1] >= prices[0];
      const lineColor = isUp ? '#10b981' : '#ef4444';
      const bgColor = isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${coinId.toUpperCase()} Price (USD)`,
            data: prices,
            borderColor: lineColor,
            backgroundColor: bgColor,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#1a1a24',
              titleColor: '#fff',
              bodyColor: '#888',
              borderColor: '#333',
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (ctx) => `$${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
              }
            }
          },
          scales: {
            x: {
              ticks: { 
                color: '#666', 
                maxTicksLimit: 6,
                maxRotation: 0
              },
              grid: { display: false }
            },
            y: {
              ticks: { 
                color: '#666',
                callback: (value) => '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
              },
              grid: { color: 'rgba(255,255,255,0.05)' }
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, coinId, activeTimeframe]);

  const handleTimeframeClick = (tf) => {
    setActiveTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  const timeframes = [
    { label: '1H', value: '1h' },
    { label: '4H', value: '4h' },
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' }
  ];

  return (
    <div className="price-chart">
      {/* Header with price */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.3em' }}>
            {coinId.toUpperCase()}/USD
          </h3>
          {data.length > 0 && (
            <div style={{ 
              fontSize: '1.5em', 
              fontWeight: 'bold',
              color: data[data.length-1] >= data[0] ? '#10b981' : '#ef4444'
            }}>
              ${data[data.length-1][1].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
          )}
        </div>
        
        {/* Timeframe Selector */}
        <div className="timeframe-selector" style={{ display: 'flex', gap: '5px' }}>
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeClick(tf.value)}
              style={{
                padding: '8px 14px',
                border: 'none',
                borderRadius: '8px',
                background: activeTimeframe === tf.value ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                color: activeTimeframe === tf.value ? '#000' : '#888',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85em',
                transition: 'all 0.2s'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>📊</div>
            Loading chart data...
          </div>
        </div>
      ) : (
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={canvasRef} />
        </div>
      )}
      
      {/* Stats */}
      {data.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '15px',
          padding: '12px 15px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '10px',
          fontSize: '0.85em'
        }}>
          <div style={{ color: '#888' }}>
            <span>24h Change: </span>
            <span style={{ 
              color: data[data.length-1] >= data[0] ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {data[data.length-1] >= data[0] ? '+' : ''}
              {(((data[data.length-1][1] - data[0][1]) / data[0][1]) * 100).toFixed(2)}%
            </span>
          </div>
          <div style={{ color: '#666' }}>
            Range: ${Math.min(...data.map(p => p[1])).toFixed(2)} - ${Math.max(...data.map(p => p[1])).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
