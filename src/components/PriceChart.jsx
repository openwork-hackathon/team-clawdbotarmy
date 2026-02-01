import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function PriceChart({ coinId, days = 7 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetch(`/api/chart/${coinId}?days=${days}`)
      .then(r => r.json())
      .then(d => {
        setData(d.prices || []);
        setLoading(false);
      });
  }, [coinId, days]);

  useEffect(() => {
    if (data.length > 0 && canvasRef.current) {
      // Destroy old chart if exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      const labels = data.map(p => new Date(p[0]).toLocaleDateString());
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
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#ffffff' }
            }
          },
          scales: {
            x: {
              ticks: { color: '#a0a0b0', maxTicksLimit: 10 },
              grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
              ticks: { color: '#a0a0b0' },
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
  }, [data, coinId]);

  return (
    <div className="price-chart">
      <h3>{coinId.toUpperCase()} - {days} Day Price Chart</h3>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <div style={{ height: '300px' }}>
          <canvas ref={canvasRef} />
        </div>
      )}
      {data.length > 0 && (
        <p className="price-range">
          ${Math.min(...data.map(p => p[1])).toFixed(2)} - 
          ${Math.max(...data.map(p => p[1])).toFixed(2)}
        </p>
      )}
    </div>
  );
}
