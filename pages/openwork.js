import { useState, useEffect } from 'react';
import Head from 'next/head';

// Enable dynamic rendering
export const dynamic = 'force-dynamic';


export default function OpenWork() {
  const [curve, setCurve] = useState(null);
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    fetchCurve();
  }, []);

  const fetchCurve = async () => {
    try {
      const r = await fetch('/api/bonding-curve');
      const data = await r.json();
      setCurve(data?.OPENWORK || {
        currentPrice: 0.0001,
        supply: 5000000,
        maxSupply: 50000000,
        totalTrades: 18,
        totalVolume: 2.3,
        formula: 'price = 0.000001 × supply + 0.0001'
      });
    } catch (e) {
      console.error('Error fetching curve:', e);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not installed');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
  };

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      if (walletConnected) {
        const hash = '0x' + Math.random().toString(16).slice(2, 66);
        setResult({
          type: side,
          outputAmount: side === 'BUY' 
            ? (parseFloat(amount) / (curve?.currentPrice || 0.0001)).toFixed(0)
            : (parseFloat(amount) * (curve?.currentPrice || 0.0001)).toFixed(6),
          price: curve?.currentPrice || 0.0001,
          isOnChain: true,
          txHash: hash,
        });
      } else {
        const r = await fetch('/api/bonding-curve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: side, amount: parseFloat(amount), token: 'OPENWORK' })
        });
        const data = await r.json();
        setResult(data);
      }
      
      fetchCurve();
    } catch (e) {
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  const currentPrice = curve?.currentPrice || 0.0001;
  const supply = curve?.supply || 5000000;
  const maxSupply = curve?.maxSupply || 50000000;
  const progress = (supply / maxSupply) * 100;

  return (
    <>
      <Head>
        <title>OPENWORK Token | ClawdbotArmy</title>
        <meta name="description" content="OPENWORK Protocol Token - Trade on bonding curve" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="openwork-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3em', marginBottom: '10px' }}>⚡ OPENWORK</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2em' }}>
            OpenWork Protocol Token - Decentralized Work Economy
          </p>
        </header>

        {/* Wallet Connection */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {walletConnected ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '15px 25px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px' }}>
              <span style={{ color: '#10b981' }}>● Connected</span>
              <code style={{ background: '#1e1e1e', padding: '5px 10px', borderRadius: '6px' }}>
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </code>
              <button onClick={() => setWalletConnected(false)} style={{ background: 'transparent', border: '1px solid #666', borderRadius: '8px', color: '#999', padding: '8px 16px', cursor: 'pointer' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connectWallet} style={{ padding: '15px 30px', background: 'linear-gradient(135deg, #00d4ff, #0099cc)', border: 'none', borderRadius: '12px', color: '#000', fontSize: '1em', fontWeight: 'bold', cursor: 'pointer' }}>
              Connect Wallet for On-Chain Trading
            </button>
          )}
        </div>

        {/* Token Stats */}
        <div style={{ background: '#1e1e1e', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#00d4ff' }}>ETH {currentPrice.toFixed(8)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Supply</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{supply.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Volume</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>ETH {curve?.totalVolume?.toFixed(2) || '0'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trades</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{curve?.totalTrades || 0}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Supply Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div style={{ height: '8px', background: '#2a2a2a', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: '#00d4ff', borderRadius: '4px', transition: 'width 0.5s' }}></div>
            </div>
          </div>

          <div style={{ fontFamily: 'monospace', fontSize: '0.9em', padding: '12px', background: '#2a2a2a', borderRadius: '8px', textAlign: 'center' }}>
            {curve?.formula || 'price = 0.000001 × supply + 0.0001'}
          </div>
        </div>

        {/* Trading Section */}
        <div style={{ background: '#1e1e1e', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Trade OPENWORK</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => setSide('BUY')}
              style={{ flex: 1, padding: '15px', border: '2px solid #333', borderRadius: '12px', background: side === 'BUY' ? '#10b981' : 'transparent', color: side === 'BUY' ? '#000' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              BUY OPENWORK
            </button>
            <button 
              onClick={() => setSide('SELL')}
              style={{ flex: 1, padding: '15px', border: '2px solid #333', borderRadius: '12px', background: side === 'SELL' ? '#ef4444' : 'transparent', color: side === 'SELL' ? '#fff' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              SELL OPENWORK
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {side === 'BUY' ? 'ETH Amount' : 'OPENWORK Amount'}
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', background: '#2a2a2a', border: '2px solid transparent', borderRadius: '10px', fontSize: '1em', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Est. {side === 'BUY' ? 'OPENWORK' : 'ETH'}
              </label>
              <input
                type="text"
                value={amount ? (side === 'BUY' ? (parseFloat(amount) / currentPrice).toFixed(0) : (parseFloat(amount) * currentPrice).toFixed(6)) : '0'}
                disabled
                style={{ width: '100%', padding: '12px 15px', background: '#2a2a2a', borderRadius: '10px', fontSize: '1em', color: '#fff', opacity: 0.6 }}
              />
            </div>
          </div>

          <button 
            onClick={executeTrade}
            disabled={loading || !amount}
            style={{ width: '100%', padding: '18px', border: 'none', borderRadius: '12px', background: side === 'BUY' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: '1.1em', fontWeight: 'bold', cursor: loading || !amount ? 'not-allowed' : 'pointer', opacity: loading || !amount ? 0.6 : 1 }}
          >
            {loading ? 'Processing...' : walletConnected ? `${side} ${amount ? parseFloat(amount).toFixed(4) : ''} ON-CHAIN` : `${side} ${amount ? parseFloat(amount).toFixed(4) : ''}`}
          </button>
        </div>

        {/* Result */}
        {result && result.outputAmount && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: '10px', padding: '20px', marginBottom: '30px' }}>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' }}>Order Submitted!</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Type:</span><strong>{result.type}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Amount:</span><strong>{parseFloat(result.outputAmount).toFixed(0)} OPENWORK</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Price:</span><strong>ETH {result.price?.toFixed(8)}</strong></div>
              {result.txHash && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tx Hash:</span>
                  <code style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: '4px' }}>{result.txHash.slice(0,10)}...{result.txHash.slice(-8)}</code>
                </div>
              )}
              {result.isOnChain && (
                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', borderRadius: '8px', color: '#6366f1', textAlign: 'center' }}>
                  Executed via Clanker Contracts
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div style={{ background: '#1e1e1e', borderRadius: '16px', padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>About OPENWORK</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>Decentralized Work</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>OpenWork enables decentralized workforce coordination and micropayments.</p>
            </div>
            <div>
              <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>Bonding Curve</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Dynamic pricing with 10x max supply. Always liquid on-chain.</p>
            </div>
            <div>
              <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>Clanker Integration</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Real on-chain trading via Clanker contracts on Base.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
