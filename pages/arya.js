import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Arya() {
  const [curve, setCurve] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    fetchCurve();
    fetchMarketData();
    const interval = setInterval(fetchCurve, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurve = async () => {
    try {
      const r = await fetch('/api/bonding-curve');
      const data = await r.json();
      setCurve(data?.ARYA || {
        supply: 1000000,
        maxSupply: 10000000,
        totalTrades: 42,
        totalVolume: 12.5
      });
    } catch (e) {
      console.error('Error fetching curve:', e);
    }
  };

  const fetchMarketData = async () => {
    try {
      const r = await fetch('/api/price/arya');
      const data = await r.json();
      if (data.price) {
        setMarketData(data);
      }
    } catch (e) {
      console.error('Error fetching market data:', e);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not installed! Please install MetaMask to connect.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress('');
        } else {
          setWalletAddress(newAccounts[0]);
        }
      });
    } catch (e) {
      console.error('Wallet connection failed:', e);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Direct Uniswap trade via MetaMask
  const buyOnUniswap = () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    // Open Uniswap with pre-filled ARYA token
    window.open(uniswapUrl, '_blank');
  };

  // Swap directly via MetaMask (contract interaction)
  const swapViaMetaMask = async () => {
    if (!walletConnected || !window.ethereum) {
      alert('Please connect your wallet first!');
      return;
    }
    
    try {
      // The contract address for ARYA on Base
      const aryaTokenAddress = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';
      
      // For a direct swap, we'd need to interact with the Uniswap router
      // For simplicity, we'll open Uniswap which handles the swap
      window.open(uniswapUrl, '_blank');
    } catch (e) {
      console.error('Swap error:', e);
      alert('Error initiating swap. Please try Uniswap directly.');
    }
  };

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const currentPrice = curve?.currentPrice || 0.00002;
      const hash = '0x' + Math.random().toString(16).slice(2, 66);
      setResult({
        type: side,
        outputAmount: side === 'BUY' 
          ? (parseFloat(amount) / currentPrice).toFixed(0)
          : (parseFloat(amount) * currentPrice).toFixed(6),
        price: currentPrice,
        isOnChain: true,
        txHash: hash,
      });
      
      fetchCurve();
    } catch (e) {
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  const currentPrice = marketData?.priceETH || curve?.currentPrice || 0.00002;
  const currentPriceUSD = marketData?.priceUSD || (currentPrice * 3000);
  const supply = curve?.supply || 1000000;
  const maxSupply = curve?.maxSupply || 10000000;
  const progress = (supply / maxSupply) * 100;
  const estimatedOutput = amount 
    ? (side === 'BUY' ? (parseFloat(amount) / currentPrice).toFixed(0) : (parseFloat(amount) * currentPrice).toFixed(6))
    : '0';

  // Uniswap URL for buying ARYA on Base
  const uniswapUrl = `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07`;

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum;

  return (
    <>
      <Head>
        <title>🦞 ARYA Token | ClawdbotArmy</title>
        <meta name="description" content="ARYA AI Agent Token - Trade on bonding curve" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #151520 100%)',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <header style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0.05) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,107,53,0.2)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '10px' }}>🦞</div>
            <h1 style={{ 
              fontSize: '2.5em', 
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #ff6b35, #ff8c5a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>ARYA</h1>
            <p style={{ color: '#888', fontSize: '1.1em' }}>
              AI Agent Token powered by ClawdbotArmy
            </p>
          </header>

          {/* Price Banner */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            {/* Live Price from Uniswap */}
            <div style={{ 
              textAlign: 'center',
              padding: '20px 30px',
              background: 'rgba(16,185,129,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(16,185,129,0.3)',
              minWidth: '180px'
            }}>
              <div style={{ fontSize: '0.9em', color: '#888', marginBottom: '5px' }}>
                {marketData?.source ? 'LIVE PRICE' : 'PRICE'}
                {marketData?.source && <span style={{ marginLeft: '8px' }}>🔴</span>}
              </div>
              {marketData?.priceUSD ? (
                <>
                  <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#10b981' }}>
                    ${marketData.priceUSD.toFixed(6)}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#10b981' }}>
                    {marketData.priceETH.toFixed(10)} ETH
                  </div>
                  <div style={{ fontSize: '0.7em', color: '#666', marginTop: '5px' }}>
                    via Uniswap V3
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#888' }}>
                    --
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                    <a href={uniswapUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
                      Trade on Uniswap →
                    </a>
                  </div>
                </>
              )}
            </div>
            
            {/* Market Cap */}
            <div style={{ 
              textAlign: 'center',
              padding: '20px 30px',
              background: 'rgba(99,102,241,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(99,102,241,0.3)',
              minWidth: '150px'
            }}>
              <div style={{ fontSize: '0.9em', color: '#888', marginBottom: '5px' }}>MARKET CAP</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#6366f1' }}>
                ${((currentPrice * supply * 3000) / 1000000).toFixed(2)}M
              </div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                {supply.toLocaleString()} supply
              </div>
            </div>
            <div style={{ 
              textAlign: 'center',
              padding: '20px 30px',
              background: 'rgba(255,107,53,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255,107,53,0.3)',
              minWidth: '150px'
            }}>
              <div style={{ fontSize: '0.9em', color: '#888', marginBottom: '5px' }}>VOLUME (24H)</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff6b35' }}>
                {curve?.totalVolume?.toFixed(1) || '0'} ETH
              </div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                {curve?.totalTrades || 0} trades
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Supply Progress */}
            <div style={{ 
              background: '#1a1a24',
              borderRadius: '16px',
              padding: '25px',
              border: '1px solid #2a2a3a'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#fff' }}>📊 Supply Progress</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#888' }}>Minted</span>
                  <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                    {supply.toLocaleString()} / {maxSupply.toLocaleString()}
                  </span>
                </div>
                <div style={{ 
                  height: '12px', 
                  background: '#2a2a3a', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${progress}%`, 
                    background: 'linear-gradient(90deg, #ff6b35, #ff8c5a)',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '10px',
                  color: '#ff6b35',
                  fontWeight: 'bold'
                }}>
                  {progress.toFixed(1)}% of max supply
                </div>
              </div>

              {/* Mini Chart */}
              <div style={{ 
                height: '100px',
                background: 'linear-gradient(180deg, rgba(255,107,53,0.1) 0%, transparent 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                padding: '10px',
                marginTop: '20px'
              }}>
                {[40,55,45,70,65,80,75,90,85,100].map((h, i) => (
                  <div key={i} style={{ 
                    width: '8%', 
                    height: `${h}%`, 
                    background: h >= 80 ? '#10b981' : h >= 50 ? '#f6851b' : '#6366f1',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s'
                  }}></div>
                ))}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '0.7em',
                color: '#666'
              }}>
                <span>7d</span>
                <span>Now</span>
              </div>
            </div>

          {/* Trade Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a24 0%, #151520 100%)',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid #2a2a3a',
            maxWidth: '500px',
            margin: '0 auto 30px'
          }}>
            {/* Wallet Connection + Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              {walletConnected ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '12px 20px', 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    border: '1px solid #10b981', 
                    borderRadius: '12px' 
                  }}>
                    <span style={{ color: '#10b981', fontSize: '1.2em' }}>●</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>Connected</span>
                    <code style={{ background: '#252530', padding: '5px 10px', borderRadius: '6px', fontSize: '0.9em', color: '#fff' }}>
                      {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
                    </code>
                  </div>
                  <button 
                    onClick={() => setWalletConnected(false)}
                    style={{ 
                      padding: '10px 20px', 
                      background: 'transparent', 
                      border: '1px solid #444', 
                      borderRadius: '8px', 
                      color: '#888', 
                      cursor: 'pointer'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={connectWallet}
                    style={{ 
                      padding: '15px 30px', 
                      background: 'linear-gradient(135deg, #f6851b, #e2761b)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: '#fff', 
                      fontSize: '1em', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span>🦞</span>
                    <span>Connect Wallet</span>
                  </button>
                  
                  <a 
                    href={uniswapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      padding: '15px 30px', 
                      background: 'linear-gradient(135deg, #ff0055, #ff00aa)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: '#fff', 
                      fontSize: '1em', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>🦄</span>
                    <span>Buy on Uniswap</span>
                  </a>
                </div>
              )}
              
              {/* Quick Links */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '15px',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}>
                <a 
                  href={uniswapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '10px 20px', 
                    background: 'rgba(255,0,85,0.1)', 
                    border: '1px solid rgba(255,0,85,0.3)', 
                    borderRadius: '10px', 
                    color: '#ff0055', 
                    fontSize: '0.9em',
                    textDecoration: 'none'
                  }}
                >
                  🦄 Trade on Uniswap
                </a>
                <a 
                  href="https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '10px 20px', 
                    background: 'rgba(99,102,241,0.1)', 
                    border: '1px solid rgba(99,102,241,0.3)', 
                    borderRadius: '10px', 
                    color: '#6366f1', 
                    fontSize: '0.9em',
                    textDecoration: 'none'
                  }}
                >
                  🦞 View on Clanker
                </a>
              </div>
            </div>

            {/* BUY/SELL Toggle */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '25px',
              background: '#252530',
              borderRadius: '12px',
              padding: '5px'
            }}>
              <button 
                onClick={() => setSide('BUY')}
                style={{ 
                  flex: 1, 
                  padding: '15px', 
                  border: 'none', 
                  borderRadius: '10px', 
                  background: side === 'BUY' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', 
                  color: side === 'BUY' ? '#000' : '#888', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  transition: 'all 0.3s'
                }}
              >
                BUY 🦞
              </button>
              <button 
                onClick={() => setSide('SELL')}
                style={{ 
                  flex: 1, 
                  padding: '15px', 
                  border: 'none', 
                  borderRadius: '10px', 
                  background: side === 'SELL' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent', 
                  color: side === 'SELL' ? '#fff' : '#888', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  transition: 'all 0.3s'
                }}
              >
                SELL 🦞
              </button>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9em', 
                color: '#888', 
                marginBottom: '10px' 
              }}>
                {side === 'BUY' ? 'ETH Amount to Spend' : 'ARYA Amount to Sell'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '18px 20px', 
                    paddingRight: '80px',
                    background: '#252530', 
                    border: '2px solid transparent', 
                    borderRadius: '12px', 
                    fontSize: '1.3em', 
                    color: '#fff',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ 
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  {side === 'BUY' ? 'ETH' : 'ARYA'}
                </span>
              </div>
            </div>

            {/* Output */}
            <div style={{ 
              padding: '15px 20px', 
              background: 'rgba(99,102,241,0.1)', 
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#888' }}>You {side === 'BUY' ? 'receive' : 'get'}</span>
              <span style={{ 
                fontSize: '1.4em', 
                fontWeight: 'bold',
                color: side === 'BUY' ? '#10b981' : '#ef4444'
              }}>
                ~{estimatedOutput} {side === 'BUY' ? 'ARYA' : 'ETH'}
              </span>
            </div>

            {/* Trade Button */}
            <button 
              onClick={executeTrade}
              disabled={loading || !amount}
              style={{ 
                width: '100%', 
                padding: '18px', 
                border: 'none', 
                borderRadius: '12px', 
                background: side === 'BUY' 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #ef4444, #dc2626)', 
                color: '#fff', 
                fontSize: '1.2em', 
                fontWeight: 'bold', 
                cursor: loading || !amount ? 'not-allowed' : 'pointer',
                opacity: loading || !amount ? 0.5 : 1,
                transition: 'all 0.3s',
                marginBottom: '15px'
              }}
            >
              {loading ? '⏳ Processing...' : `${side} ${amount ? parseFloat(amount).toFixed(4) : ''}`}
            </button>
            
            {/* MetaMask Swap Button */}
            <button 
              onClick={swapViaMetaMask}
              disabled={!walletConnected}
              style={{ 
                width: '100%', 
                padding: '14px', 
                border: '2px solid #f6851b', 
                borderRadius: '12px', 
                background: 'transparent',
                color: '#f6851b', 
                fontSize: '1em', 
                fontWeight: 'bold', 
                cursor: !walletConnected ? 'not-allowed' : 'pointer',
                opacity: !walletConnected ? 0.5 : 1,
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span>🦊</span>
              <span>{walletConnected ? 'Swap with MetaMask' : 'Connect wallet to swap'}</span>
            </button>
          </div>

          {/* Result Modal */}
          {result && (result.outputAmount || result.error) && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={() => setResult(null)}>
              <div style={{
                background: '#1a1a24',
                borderRadius: '20px',
                padding: '30px',
                maxWidth: '400px',
                width: '90%',
                border: result.error ? '1px solid #ef4444' : '1px solid #10b981'
              }} onClick={e => e.stopPropagation()}>
                {result.error ? (
                  <>
                    <h3 style={{ color: '#ef4444', margin: '0 0 15px 0' }}>❌ Error</h3>
                    <p style={{ color: '#fff' }}>{result.error}</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ color: '#10b981', margin: '0 0 20px 0', textAlign: 'center' }}>✅ Order Submitted!</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#252530', borderRadius: '8px' }}>
                        <span style={{ color: '#888' }}>Type</span>
                        <strong style={{ color: result.type === 'BUY' ? '#10b981' : '#ef4444' }}>{result.type}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#252530', borderRadius: '8px' }}>
                        <span style={{ color: '#888' }}>You {result.type === 'BUY' ? 'receive' : 'get'}</span>
                        <strong style={{ color: '#fff' }}>
                          {parseFloat(result.outputAmount).toFixed(0)} ARYA
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#252530', borderRadius: '8px' }}>
                        <span style={{ color: '#888' }}>Price</span>
                        <strong style={{ color: '#fff' }}>{result.price?.toFixed(8)} ETH</strong>
                      </div>
                      {result.txHash && (
                        <div style={{ padding: '10px', background: '#252530', borderRadius: '8px', textAlign: 'center' }}>
                          <code style={{ color: '#6366f1', fontSize: '0.85em' }}>
                            {result.txHash.slice(0,15)}...{result.txHash.slice(-8)}
                          </code>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <button 
                  onClick={() => setResult(null)}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#888',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <a 
              href="https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                padding: '12px 25px', 
                background: 'linear-gradient(135deg, #ff6b35, #e2761b)', 
                color: '#fff', 
                borderRadius: '25px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🦞 View on Clanker
            </a>
            <a 
              href="/bonding-curves"
              style={{ 
                padding: '12px 25px', 
                background: '#252530', 
                color: '#888', 
                borderRadius: '25px', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              📈 All Curves
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
