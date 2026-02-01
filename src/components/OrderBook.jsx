import { useState, useEffect } from 'react';

function OrderRow({ price, amount, total, type, maxTotal }) {
  const percent = (total / maxTotal) * 100;
  
  return (
    <div className={`order-row ${type}`}>
      <div className="order-bg" style={{ width: `${percent}%` }}></div>
      <span className="order-price">{price}</span>
      <span className="order-amount">{amount.toFixed(4)}</span>
      <span className="order-total">{total.toFixed(2)}</span>
    </div>
  );
}

export default function OrderBook({ symbol = 'BTC' }) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [spread, setSpread] = useState(0);
  const [spreadPercent, setSpreadPercent] = useState(0);

  // Generate mock order book data
  useEffect(() => {
    const generateOrders = () => {
      const basePrice = 78000;
      
      // Bids (buy orders) - below current price
      const newBids = [];
      for (let i = 0; i < 12; i++) {
        const price = basePrice - (i * 15) - Math.random() * 10;
        const amount = (Math.random() * 2 + 0.1).toFixed(4);
        const total = parseFloat(amount) * price;
        newBids.push({ price: price.toFixed(1), amount, total, depth: 100 - i * 8 });
      }
      setBids(newBids);
      
      // Asks (sell orders) - above current price
      const newAsks = [];
      for (let i = 0; i < 12; i++) {
        const price = basePrice + (i * 15) + Math.random() * 10;
        const amount = (Math.random() * 2 + 0.1).toFixed(4);
        const total = parseFloat(amount) * price;
        newAsks.push({ price: price.toFixed(1), amount, total, depth: 100 - i * 8 });
      }
      setAsks(newAsks);
      
      // Calculate spread
      const bidPrice = parseFloat(newBids[0]?.price || 0);
      const askPrice = parseFloat(newAsks[0]?.price || 0);
      setSpread(askPrice - bidPrice);
      setSpreadPercent(((askPrice - bidPrice) / bidPrice) * 100);
    };

    generateOrders();
  }, [symbol]);

  const maxTotal = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total)
  );

  return (
    <div className="order-book">
      <div className="order-header">
        <h4>📋 Order Book</h4>
        <div className="spread-info">
          <span className="spread-label">Spread</span>
          <span className="spread-value">${spread.toFixed(1)} ({spreadPercent.toFixed(3)}%)</span>
        </div>
      </div>

      <div className="order-columns">
        <div className="column asks">
          <div className="column-header">
            <span>Price (USD)</span>
            <span>Amount</span>
            <span>Total</span>
          </div>
          <div className="asks-list">
            {[...asks].reverse().map((order, i) => (
              <OrderRow 
                key={i}
                price={order.price}
                amount={parseFloat(order.amount)}
                total={order.total}
                type="ask"
                maxTotal={maxTotal}
              />
            ))}
          </div>
        </div>

        <div className="current-price">
          <span className="mid-price">78,234.50</span>
          <span className="mid-change">$78,234.50</span>
        </div>

        <div className="column bids">
          <div className="column-header">
            <span>Price (USD)</span>
            <span>Amount</span>
            <span>Total</span>
          </div>
          <div className="bids-list">
            {bids.map((order, i) => (
              <OrderRow 
                key={i}
                price={order.price}
                amount={parseFloat(order.amount)}
                total={order.total}
                type="bid"
                maxTotal={maxTotal}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
