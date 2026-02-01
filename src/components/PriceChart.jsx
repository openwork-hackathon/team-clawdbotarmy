import { useState, useEffect, useRef } from 'react';

export default function PriceChart({ coinId, days = 7 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch(`/api/chart/${coinId}?days=${days}`)
      .then(r => r.json())
      .then(d => {
        setData(d.prices || []);
        setLoading(false);
        drawChart(d.prices || []);
      });
  }, [coinId, days]);

  const drawChart = (prices) => {
    if (!canvasRef.current || prices.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    
    if (prices.length < 2) return;
    
    const min = Math.min(...prices.map(p => p[1]));
    const max = Math.max(...prices.map(p => p[1]));
    const range = max - min || 1;
    
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p[1] - min) / range) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
  };

  return (
    <div className="price-chart">
      <h3>{coinId.toUpperCase()} - {days} Day Price Chart</h3>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={300}
          style={{ maxWidth: '100%' }}
        />
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
