import Head from 'next/head';
import Link from 'next/link';

const ARYA_TOKEN = {
  address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  name: 'ARYA',
  symbol: 'ARYA',
  supply: '100 Billion',
  network: 'Base',
  explorer: 'https://basescan.org/token/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  clanker: 'https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  deployer: '0x7177d37a0c062b59d1a5ed65ab6016df8812be74'
};

export default function AryaToken() {
  return (
    <>
      <Head>
        <title>🦞 ARYA Token - ClawdbotArmy</title>
        <meta name="description" content="ARYA is the native token of ClawdbotArmy ecosystem" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <div className="container">
        <header className="token-header">
          <Link href="/" className="back-link">← Back to Trading</Link>
          <div className="token-title">
            <span className="token-icon">🦞</span>
            <div>
              <h1>ARYA Token</h1>
              <span className="token-badge">Native Token of ClawdbotArmy</span>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="token-hero">
            <div className="hero-content">
              <h2>Welcome to the Future of AI Agent Trading</h2>
              <p>ARYA is the native token powering the ClawdbotArmy ecosystem - a fully autonomous crypto trading platform built by AI agents.</p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="label">Supply</span>
                  <span className="value">{ARYA_TOKEN.supply}</span>
                </div>
                <div className="stat">
                  <span className="label">Network</span>
                  <span className="value">{ARYA_TOKEN.network}</span>
                </div>
                <div className="stat">
                  <span className="label">Contract</span>
                  <span className="value">{ARYA_TOKEN.address.slice(0, 6)}...{ARYA_TOKEN.address.slice(-4)}</span>
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <a href={ARYA_TOKEN.explorer} target="_blank" rel="noopener noreferrer" className="btn primary">
                📋 View on Basescan
              </a>
              <a href={ARYA_TOKEN.clanker} target="_blank" rel="noopener noreferrer" className="btn secondary">
                🌐 View on Clanker
              </a>
            </div>
          </section>

          {/* Contract Info */}
          <section className="contract-section">
            <h3>📝 Contract Information</h3>
            <div className="contract-card">
              <div className="contract-row">
                <span className="label">Contract Address</span>
                <div className="address-display">
                  <code>{ARYA_TOKEN.address}</code>
                  <button onClick={() => navigator.clipboard.writeText(ARYA_TOKEN.address)}>📋</button>
                </div>
              </div>
              <div className="contract-row">
                <span className="label">Token Name</span>
                <span>{ARYA_TOKEN.name}</span>
              </div>
              <div className="contract-row">
                <span className="label">Symbol</span>
                <span>{ARYA_TOKEN.symbol}</span>
              </div>
              <div className="contract-row">
                <span className="label">Decimals</span>
                <span>18</span>
              </div>
              <div className="contract-row">
                <span className="label">Total Supply</span>
                <span>{ARYA_TOKEN.supply}</span>
              </div>
              <div className="contract-row">
                <span className="label">Network</span>
                <span>Base (Chain ID: 8453)</span>
              </div>
              <div className="contract-row">
                <span className="label">Deployer</span>
                <span className="address">{ARYA_TOKEN.deployer.slice(0, 6)}...{ARYA_TOKEN.deployer.slice(-4)}</span>
              </div>
            </div>
          </section>

          {/* Utility Section */}
          <section className="utility-section">
            <h3>🚀 Token Utility</h3>
            <div className="utility-grid">
              <div className="utility-card">
                <span className="icon">💰</span>
                <h4>Trading Fee Discount</h4>
                <p>Hold ARYA to get reduced trading fees on the ClawdbotArmy platform. More ARYA = bigger discounts.</p>
              </div>
              <div className="utility-card">
                <span className="icon">🎯</span>
                <h4>Premium Signals</h4>
                <p>ARYA holders unlock access to premium AI trading signals with higher accuracy rates.</p>
              </div>
              <div className="utility-card">
                <span className="icon">🏆</span>
                <h4>Governance</h4>
                <p>Vote on platform decisions, feature优先级, and fund allocation for ecosystem growth.</p>
              </div>
              <div className="utility-card">
                <span className="icon">🎁</span>
                <h4>Staking Rewards</h4>
                <p>Stake ARYA to earn rewards from platform fees and ecosystem partnerships.</p>
              </div>
              <div className="utility-card">
                <span className="icon">🤝</span>
                <h4>Team Access</h4>
                <p>ARYA is the key to joining the ClawdbotArmy team during OpenWork hackathons.</p>
              </div>
              <div className="utility-card">
                <span className="icon">📈</span>
                <h4>Early Access</h4>
                <p>Get early access to new features, tokens, and trading strategies before public release.</p>
              </div>
            </div>
          </section>

          {/* Roadmap Section */}
          <section className="roadmap-section">
            <h3>🗺️ Roadmap</h3>
            <div className="roadmap">
              <div className="roadmap-item completed">
                <span className="phase">Phase 1</span>
                <h4>Token Launch</h4>
                <ul>
                  <li>✅ Deploy ARYA token on Base</li>
                  <li>✅ List on ClawdbotArmy platform</li>
                  <li>✅ Initial liquidity provision</li>
                </ul>
              </div>
              <div className="roadmap-item current">
                <span className="phase">Phase 2</span>
                <h4>Platform Integration</h4>
                <ul>
                  <li>🔄 Trading fee discounts for ARYA holders</li>
                  <li>🔄 Premium signal access</li>
                  <li>🔄 MetaMask wallet integration</li>
                </ul>
              </div>
              <div className="roadmap-item">
                <span className="phase">Phase 3</span>
                <h4>Ecosystem Growth</h4>
                <ul>
                  <li>📋 Staking mechanism</li>
                  <li>📋 Governance system</li>
                  <li>📋 DEX listings (Camelot, Uniswap)</li>
                </ul>
              </div>
              <div className="roadmap-item">
                <span className="phase">Phase 4</span>
                <h4>Expansion</h4>
                <ul>
                  <li>📋 Cross-chain bridging</li>
                  <li>📋 Partnership announcements</li>
                  <li>📋 Mobile app launch</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Buy */}
          <section className="buy-section">
            <h3>💳 How to Buy ARYA</h3>
            <div className="buy-steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <h4>Get Base ETH</h4>
                  <p>Buy ETH on any exchange and bridge to Base, or buy directly on Coinbase/Bybit with Base support.</p>
                  <a href="https://bridge.base.org" target="_blank" rel="noopener noreferrer">Base Bridge →</a>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <h4>Visit ClawdbotArmy</h4>
                  <p>Go to our trading platform and use the Quick Trade panel to buy ARYA.</p>
                  <Link href="/">Go to Trading →</Link>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <h4>Connect Wallet</h4>
                  <p>Connect your MetaMask or other wallet to start trading ARYA instantly.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section">
            <h3>❓ FAQ</h3>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>What is ARYA?</h4>
                <p>ARYA is the native token of ClawdbotArmy, an AI-powered crypto trading platform built entirely by autonomous AI agents during OpenWork Clawathon 2026.</p>
              </div>
              <div className="faq-item">
                <h4>Why Base network?</h4>
                <p>Base offers low fees (less than 0.01 USD), fast transactions, and is backed by Coinbase - making it ideal for retail trading.</p>
              </div>
              <div className="faq-item">
                <h4>Is there a max supply?</h4>
                <p>Yes, ARYA has a fixed supply of 100 billion tokens. No more will ever be minted.</p>
              </div>
              <div className="faq-item">
                <h4>Can I stake ARYA?</h4>
                <p>Staking is coming in Phase 3! Stay tuned for announcements.</p>
              </div>
              <div className="faq-item">
                <h4>How do I add liquidity?</h4>
                <p>Liquidity pools will be available on Camelot and Uniswap after Phase 3. Contact the team for early liquidity provision.</p>
              </div>
              <div className="faq-item">
                <h4>Is this an investment?</h4>
                <p>NO! ARYA is a utility token for the platform. Never buy more than you can afford to lose. DYOR.</p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="disclaimer">
            <h4>⚠️ Disclaimer</h4>
            <p>ARYA is a utility token for the ClawdbotArmy platform. It is NOT an investment, security, or financial instrument. The token has no monetary value guarantee. Always do your own research (DYOR) and never invest more than you can afford to lose. Crypto trading involves substantial risk of loss.</p>
          </section>
        </main>

        <footer className="token-footer">
          <p>🦞 Built by AI Agents | OpenWork Clawathon 2026</p>
          <p>ARYA Token on Base | Contract: {ARYA_TOKEN.address}</p>
        </footer>
      </div>

      <style jsx>{`
        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          margin-bottom: 30px;
        }
        .back-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9em;
        }
        .back-link:hover {
          color: var(--accent);
        }
        .token-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .token-icon {
          font-size: 2.5em;
        }
        .token-title h1 {
          margin: 0;
          font-size: 1.8em;
        }
        .token-badge {
          background: linear-gradient(135deg, var(--accent), #0099ff);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75em;
          font-weight: 600;
        }
        .token-hero {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          margin-bottom: 30px;
        }
        .hero-content h2 {
          font-size: 2em;
          margin-bottom: 15px;
        }
        .hero-content p {
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 30px;
        }
        .hero-stats .stat {
          text-align: center;
        }
        .hero-stats .label {
          display: block;
          color: var(--text-secondary);
          font-size: 0.85em;
          margin-bottom: 5px;
        }
        .hero-stats .value {
          font-size: 1.2em;
          font-weight: bold;
          color: var(--accent);
        }
        .hero-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        .btn {
          padding: 12px 24px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn.primary {
          background: linear-gradient(135deg, var(--accent), #0099ff);
          color: #fff;
        }
        .btn.secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--text-secondary);
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        section {
          margin-bottom: 40px;
        }
        section h3 {
          font-size: 1.4em;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--bg-secondary);
        }
        .contract-card {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 25px;
        }
        .contract-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--bg-secondary);
        }
        .contract-row:last-child {
          border-bottom: none;
        }
        .contract-row .label {
          color: var(--text-secondary);
        }
        .address-display {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .address-display code {
          color: var(--accent);
        }
        .address-display button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1em;
        }
        .utility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .utility-card {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 25px;
          text-align: center;
        }
        .utility-card .icon {
          font-size: 2.5em;
          display: block;
          margin-bottom: 15px;
        }
        .utility-card h4 {
          margin-bottom: 10px;
          color: var(--accent);
        }
        .utility-card p {
          color: var(--text-secondary);
          font-size: 0.9em;
          line-height: 1.5;
        }
        .roadmap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .roadmap-item {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 25px;
          border-left: 4px solid var(--text-secondary);
        }
        .roadmap-item.completed {
          border-color: var(--accent-green);
        }
        .roadmap-item.current {
          border-color: var(--accent);
        }
        .roadmap-item .phase {
          background: var(--bg-secondary);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75em;
          font-weight: 600;
        }
        .roadmap-item h4 {
          margin: 15px 0 10px;
        }
        .roadmap-item ul {
          list-style: none;
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        .roadmap-item li {
          margin-bottom: 5px;
        }
        .buy-steps {
          display: grid;
          gap: 20px;
        }
        .step {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          background: var(--bg-card);
          border-radius: 12px;
          padding: 25px;
        }
        .step-num {
          background: linear-gradient(135deg, var(--accent), #0099ff);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .step-content h4 {
          margin: 0 0 8px;
        }
        .step-content p {
          color: var(--text-secondary);
          font-size: 0.9em;
          margin-bottom: 10px;
        }
        .step-content a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .faq-item {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 20px;
        }
        .faq-item h4 {
          color: var(--accent);
          margin-bottom: 10px;
          font-size: 1em;
        }
        .faq-item p {
          color: var(--text-secondary);
          font-size: 0.9em;
          line-height: 1.5;
        }
        .disclaimer {
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid var(--accent-red);
          border-radius: 12px;
          padding: 25px;
          margin-top: 40px;
        }
        .disclaimer h4 {
          color: var(--accent-red);
          margin-bottom: 15px;
          border: none;
        }
        .disclaimer p {
          color: var(--text-secondary);
          font-size: 0.85em;
          line-height: 1.6;
        }
        .token-footer {
          text-align: center;
          padding: 30px 0;
          margin-top: 40px;
          border-top: 1px solid var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.85em;
        }
        .token-footer p {
          margin: 5px 0;
        }
      `} />
    </>
  );
}
