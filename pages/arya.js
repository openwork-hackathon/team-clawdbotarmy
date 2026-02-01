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

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', marginBottom: '30px' },
  backLink: { color: '#a0a0b0', textDecoration: 'none', fontSize: '0.9em' },
  tokenTitle: { display: 'flex', alignItems: 'center', gap: '15px' },
  tokenIcon: { fontSize: '2.5em' },
  tokenBadge: { background: 'linear-gradient(135deg, #00d4ff, #0099ff)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75em', fontWeight: '600', color: '#fff' },
  hero: { background: '#1a1a2e', borderRadius: '16px', padding: '40px', textAlign: 'center', marginBottom: '30px' },
  heroH2: { fontSize: '2em', marginBottom: '15px' },
  heroP: { color: '#a0a0b0', maxWidth: '600px', margin: '0 auto 30px', lineHeight: '1.6' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '30px' },
  stat: { textAlign: 'center' },
  statLabel: { display: 'block', color: '#a0a0b0', fontSize: '0.85em', marginBottom: '5px' },
  statValue: { fontSize: '1.2em', fontWeight: 'bold', color: '#00d4ff' },
  heroActions: { display: 'flex', gap: '15px', justifyContent: 'center' },
  btn: { padding: '12px 24px', borderRadius: '25px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s' },
  btnPrimary: { background: 'linear-gradient(135deg, #00d4ff, #0099ff)', color: '#fff' },
  btnSecondary: { background: '#1a1a2e', color: '#fff', border: '1px solid #a0a0b0' },
  section: { marginBottom: '40px' },
  h3: { fontSize: '1.4em', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #1a1a2e' },
  contractCard: { background: '#1a1a2e', borderRadius: '12px', padding: '25px' },
  contractRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1a1a2e' },
  addressDisplay: { display: 'flex', alignItems: 'center', gap: '10px' },
  utilityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  utilityCard: { background: '#1a1a2e', borderRadius: '12px', padding: '25px', textAlign: 'center' },
  utilityIcon: { fontSize: '2.5em', marginBottom: '15px', display: 'block' },
  roadmap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  roadmapItem: { background: '#1a1a2e', borderRadius: '12px', padding: '25px', borderLeft: '4px solid #a0a0b0' },
  roadmapCompleted: { borderLeft: '4px solid #00ff88' },
  roadmapCurrent: { borderLeft: '4px solid #00d4ff' },
  phase: { background: '#1a1a2e', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75em', fontWeight: '600' },
  buySteps: { display: 'grid', gap: '20px' },
  step: { display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#1a1a2e', borderRadius: '12px', padding: '25px' },
  stepNum: { background: 'linear-gradient(135deg, #00d4ff, #0099ff)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: '0' },
  stepContentH4: { margin: '0 0 8px' },
  stepContentP: { color: '#a0a0b0', fontSize: '0.9em', marginBottom: '10px' },
  stepContentA: { color: '#00d4ff', textDecoration: 'none', fontWeight: '500' },
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  faqItem: { background: '#1a1a2e', borderRadius: '12px', padding: '20px' },
  faqH4: { color: '#00d4ff', marginBottom: '10px', fontSize: '1em' },
  faqP: { color: '#a0a0b0', fontSize: '0.9em', lineHeight: '1.5' },
  disclaimer: { background: 'rgba(255, 71, 87, 0.1)', border: '1px solid #ff4757', borderRadius: '12px', padding: '25px', marginTop: '40px' },
  disclaimerH4: { color: '#ff4757', marginBottom: '15px' },
  disclaimerP: { color: '#a0a0b0', fontSize: '0.85em', lineHeight: '1.6' },
  footer: { textAlign: 'center', padding: '30px 0', marginTop: '40px', borderTop: '1px solid #1a1a2e', color: '#a0a0b0', fontSize: '0.85em' },
};

export default function AryaToken() {
  return (
    <div style={styles.container}>
      <Head>
        <title>🦞 ARYA Token - ClawdbotArmy</title>
        <meta name="description" content="ARYA is the native token of ClawdbotArmy ecosystem" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>← Back to Trading</Link>
        <div style={styles.tokenTitle}>
          <span style={styles.tokenIcon}>🦞</span>
          <div>
            <h1 style={{margin: 0, fontSize: '1.8em'}}>ARYA Token</h1>
            <span style={styles.tokenBadge}>Native Token of ClawdbotArmy</span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={styles.hero}>
          <h2 style={styles.heroH2}>Welcome to the Future of AI Agent Trading</h2>
          <p style={styles.heroP}>ARYA is the native token powering the ClawdbotArmy ecosystem - a fully autonomous crypto trading platform built by AI agents.</p>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Supply</span>
              <span style={styles.statValue}>{ARYA_TOKEN.supply}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Network</span>
              <span style={styles.statValue}>{ARYA_TOKEN.network}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Contract</span>
              <span style={styles.statValue}>{ARYA_TOKEN.address.slice(0, 6)}...{ARYA_TOKEN.address.slice(-4)}</span>
            </div>
          </div>
          <div style={styles.heroActions}>
            <a href={ARYA_TOKEN.explorer} target="_blank" rel="noopener noreferrer" style={{...styles.btn, ...styles.btnPrimary}}>📋 View on Basescan</a>
            <a href={ARYA_TOKEN.clanker} target="_blank" rel="noopener noreferrer" style={{...styles.btn, ...styles.btnSecondary}}>🌐 View on Clanker</a>
          </div>
        </section>

        {/* Contract Info */}
        <section style={styles.section}>
          <h3 style={styles.h3}>📝 Contract Information</h3>
          <div style={styles.contractCard}>
            <div style={styles.contractRow}>
              <span style={{color: '#a0a0b0'}}>Contract Address</span>
              <div style={styles.addressDisplay}>
                <code style={{color: '#00d4ff'}}>{ARYA_TOKEN.address}</code>
                <button onClick={() => navigator.clipboard.writeText(ARYA_TOKEN.address)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1em'}}>📋</button>
              </div>
            </div>
            <div style={styles.contractRow}>
              <span style={{color: '#a0a0b0'}}>Token Name</span>
              <span>{ARYA_TOKEN.name}</span>
            </div>
            <div style={styles.contractRow}>
              <span style={{color: '#a0a0b0'}}>Symbol</span>
              <span>{ARYA_TOKEN.symbol}</span>
            </div>
            <div style={styles.contractRow}>
              <span style={{color: '#a0a0b0'}}>Decimals</span>
              <span>18</span>
            </div>
            <div style={styles.contractRow}>
              <span style={{color: '#a0a0b0'}}>Total Supply</span>
              <span>{ARYA_TOKEN.supply}</span>
            </div>
            <div style={styles.contractRow}>
              <span style={{color: '#a0a0b0'}}>Network</span>
              <span>Base (Chain ID: 8453)</span>
            </div>
          </div>
        </section>

        {/* Utility Section */}
        <section style={styles.section}>
          <h3 style={styles.h3}>🚀 Token Utility</h3>
          <div style={styles.utilityGrid}>
            <div style={styles.utilityCard}>
              <span style={styles.utilityIcon}>💰</span>
              <h4 style={{marginBottom: '10px', color: '#00d4ff'}}>Trading Fee Discount</h4>
              <p style={{color: '#a0a0b0', fontSize: '0.9em'}}>Hold ARYA to get reduced trading fees on the ClawdbotArmy platform. More ARYA = bigger discounts.</p>
            </div>
            <div style={styles.utilityCard}>
              <span style={styles.utilityIcon}>🎯</span>
              <h4 style={{marginBottom: '10px', color: '#00d4ff'}}>Premium Signals</h4>
              <p style={{color: '#a0a0b0', fontSize: '0.9em'}}>ARYA holders unlock access to premium AI trading signals with higher accuracy rates.</p>
            </div>
            <div style={styles.utilityCard}>
              <span style={styles.utilityIcon}>🏆</span>
              <h4 style={{marginBottom: '10px', color: '#00d4ff'}}>Governance</h4>
              <p style={{color: '#a0a0b0', fontSize: '0.9em'}}>Vote on platform decisions, feature prioritization, and fund allocation for ecosystem growth.</p>
            </div>
            <div style={styles.utilityCard}>
              <span style={styles.utilityIcon}>🎁</span>
              <h4 style={{marginBottom: '10px', color: '#00d4ff'}}>Staking Rewards</h4>
              <p style={{color: '#a0a0b0', fontSize: '0.9em'}}>Stake ARYA to earn rewards from platform fees and ecosystem partnerships.</p>
            </div>
            <div style={styles.utilityCard}>
              <span style={styles.utilityIcon}>🤝</span>
              <h4 style={{marginBottom: '10px', color: '#00d4ff'}}>Team Access</h4>
              <p style={{color: '#a0a0b0', fontSize: '0.9em'}}>ARYA is the key to joining the ClawdbotArmy team during OpenWork hackathons.</p>
            </div>
            <div style={styles.utilityCard}>
              <span style={styles.utilityIcon}>📈</span>
              <h4 style={{marginBottom: '10px', color: '#00d4ff'}}>Early Access</h4>
              <p style={{color: '#a0a0b0', fontSize: '0.9em'}}>Get early access to new features, tokens, and trading strategies before public release.</p>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section style={styles.section}>
          <h3 style={styles.h3}>🗺️ Roadmap</h3>
          <div style={styles.roadmap}>
            <div style={{...styles.roadmapItem, ...styles.roadmapCompleted}}>
              <span style={styles.phase}>Phase 1</span>
              <h4 style={{margin: '15px 0 10px'}}>Token Launch</h4>
              <ul style={{listStyle: 'none', fontSize: '0.85em', color: '#a0a0b0', padding: 0}}>
                <li style={{marginBottom: '5px'}}>✅ Deploy ARYA token on Base</li>
                <li style={{marginBottom: '5px'}}>✅ List on ClawdbotArmy platform</li>
                <li style={{marginBottom: '5px'}}>✅ Initial liquidity provision</li>
              </ul>
            </div>
            <div style={{...styles.roadmapItem, ...styles.roadmapCurrent}}>
              <span style={styles.phase}>Phase 2</span>
              <h4 style={{margin: '15px 0 10px'}}>Platform Integration</h4>
              <ul style={{listStyle: 'none', fontSize: '0.85em', color: '#a0a0b0', padding: 0}}>
                <li style={{marginBottom: '5px'}}>🔄 Trading fee discounts for ARYA holders</li>
                <li style={{marginBottom: '5px'}}>🔄 Premium signal access</li>
                <li style={{marginBottom: '5px'}}>🔄 MetaMask wallet integration</li>
              </ul>
            </div>
            <div style={styles.roadmapItem}>
              <span style={styles.phase}>Phase 3</span>
              <h4 style={{margin: '15px 0 10px'}}>Ecosystem Growth</h4>
              <ul style={{listStyle: 'none', fontSize: '0.85em', color: '#a0a0b0', padding: 0}}>
                <li style={{marginBottom: '5px'}}>📋 Staking mechanism</li>
                <li style={{marginBottom: '5px'}}>📋 Governance system</li>
                <li style={{marginBottom: '5px'}}>📋 DEX listings (Camelot, Uniswap)</li>
              </ul>
            </div>
            <div style={styles.roadmapItem}>
              <span style={styles.phase}>Phase 4</span>
              <h4 style={{margin: '15px 0 10px'}}>Expansion</h4>
              <ul style={{listStyle: 'none', fontSize: '0.85em', color: '#a0a0b0', padding: 0}}>
                <li style={{marginBottom: '5px'}}>📋 Cross-chain bridging</li>
                <li style={{marginBottom: '5px'}}>📋 Partnership announcements</li>
                <li style={{marginBottom: '5px'}}>📋 Mobile app launch</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Buy */}
        <section style={styles.section}>
          <h3 style={styles.h3}>💳 How to Buy ARYA</h3>
          <div style={styles.buySteps}>
            <div style={styles.step}>
              <span style={styles.stepNum}>1</span>
              <div style={{flex: 1}}>
                <h4 style={styles.stepContentH4}>Get Base ETH</h4>
                <p style={styles.stepContentP}>Buy ETH on any exchange and bridge to Base, or buy directly on Coinbase/Bybit with Base support.</p>
                <a href="https://bridge.base.org" target="_blank" rel="noopener noreferrer" style={styles.stepContentA}>Base Bridge →</a>
              </div>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNum}>2</span>
              <div style={{flex: 1}}>
                <h4 style={styles.stepContentH4}>Visit ClawdbotArmy</h4>
                <p style={styles.stepContentP}>Go to our trading platform and use the Quick Trade panel to buy ARYA.</p>
                <Link href="/" style={styles.stepContentA}>Go to Trading →</Link>
              </div>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNum}>3</span>
              <div style={{flex: 1}}>
                <h4 style={styles.stepContentH4}>Connect Wallet</h4>
                <p style={styles.stepContentP}>Connect your MetaMask or other wallet to start trading ARYA instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={styles.section}>
          <h3 style={styles.h3}>❓ FAQ</h3>
          <div style={styles.faqGrid}>
            <div style={styles.faqItem}>
              <h4 style={styles.faqH4}>What is ARYA?</h4>
              <p style={styles.faqP}>ARYA is the native token of ClawdbotArmy, an AI-powered crypto trading platform built entirely by autonomous AI agents during OpenWork Clawathon 2026.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqH4}>Why Base network?</h4>
              <p style={styles.faqP}>Base offers low fees (less than 0.01 USD), fast transactions, and is backed by Coinbase - making it ideal for retail trading.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqH4}>Is there a max supply?</h4>
              <p style={styles.faqP}>Yes, ARYA has a fixed supply of 100 billion tokens. No more will ever be minted.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqH4}>Can I stake ARYA?</h4>
              <p style={styles.faqP}>Staking is coming in Phase 3! Stay tuned for announcements.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqH4}>How do I add liquidity?</h4>
              <p style={styles.faqP}>Liquidity pools will be available on Camelot and Uniswap after Phase 3. Contact the team for early liquidity provision.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqH4}>Is this an investment?</h4>
              <p style={styles.faqP}>NO! ARYA is a utility token for the platform. Never buy more than you can afford to lose. DYOR.</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section style={styles.disclaimer}>
          <h4 style={styles.disclaimerH4}>⚠️ Disclaimer</h4>
          <p style={styles.disclaimerP}>ARYA is a utility token for the ClawdbotArmy platform. It is NOT an investment, security, or financial instrument. The token has no monetary value guarantee. Always do your own research (DYOR) and never invest more than you can afford to lose. Crypto trading involves substantial risk of loss.</p>
        </section>
      </main>

      <footer style={styles.footer}>
        <p style={{margin: '5px 0'}}>🦞 Built by AI Agents | OpenWork Clawathon 2026</p>
        <p style={{margin: '5px 0'}}>ARYA Token on Base | Contract: {ARYA_TOKEN.address}</p>
      </footer>
    </div>
  );
}
