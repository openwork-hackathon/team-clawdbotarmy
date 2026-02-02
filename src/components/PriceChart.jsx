import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function PriceChart({ coinId, days = 7, timeframe = '1d', onTimeframeChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Fetch chart data
  useEffect(() => {
    setLoading(true);
    // Add timestamp to bypass Vercel cache
    fetch(`/api/chart/${coinId}?days=${days}&timeframe=${activeTimeframe}&_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        setData(d.prices || []);
        setLoading(false);
      })
      .catch(e => {
        console.error('Error fetching chart:', e);
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
      
      // Format labels based on timeframe
      const formatLabel = (timestamp) => {
        const date = new Date(timestamp);
        if (['1m', '5m', '15m'].includes(activeTimeframe)) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (activeTimeframe === '1h' || activeTimeframe === '4h') {
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit' });
        } else {
          return date.toLocaleDateString();
        }
      };

      const labels = data.map(p => formatLabel(p[0]));
      const prices = data.map(p => p[1]);

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${coinId.toUpperCase()} Price (USD)`,
            data: prices,
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4
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
              labels: { color: '#ffffff' }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`
              }
            }
          },
          scales: {
            x: {
              ticks: { 
                color: '#a0a0b0', 
                maxTicksLimit: 8,
                maxRotation: 0
              },
              grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
              ticks: { 
                color: '#a0a0b0',
                callback: (value) => '$' + value.toLocaleString()
              },
              grid: { color: 'rgba(255,255,255,0.1)' }
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

  return (
    <div className="price-chart">
      <h3>{coinId.toUpperCase()} - {activeTimeframe.toUpperCase()} Chart</h3>
      
      {/* Timeframe Selector */}
      <div className="timeframe-selector" style={{ marginBottom: '15px' }}>
        {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(tf => (
          <button
            key={tf}
            className={`tf ${activeTimeframe === tf ? 'active' : ''}`}
            onClick={() => handleTimeframeClick(tf)}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: activeTimeframe === tf ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeTimeframe === tf ? '#000' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              marginRight: '5px',
              transition: 'all 0.2s'
            }}
          >
            {tf}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <div style={{ height: '300px' }}>
          <canvas ref={canvasRef} />
        </div>
      )}
      
      {data.length > 0 && (
        <p className="price-range" style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
          Range: ${Math.min(...data.map(p => p[1])).toFixed(2)} - 
          ${Math.max(...data.map(p => p[1])).toFixed(2)}
        </p>
      )}
    </div>
  );
}
