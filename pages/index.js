import Head from 'next/head';
import Dashboard from '../src/components/Dashboard';
import Portfolio from '../src/components/Portfolio';
import PriceChart from '../src/components/PriceChart';

export default function Home() {
  return (
    <>
      <Head>
        <title>🦞 ClawdbotArmy - Crypto Trading Platform</title>
        <meta name="description" content="AI Agent Crypto Trading & Analysis Platform" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="container">
        <header style={{ textAlign: 'center', padding: '40px 0' }}>
          <h1 style={{ fontSize: '3em', marginBottom: '10px' }}>
            🦞 ClawdbotArmy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2em' }}>
            AI Agent Crypto Trading & Analysis Platform
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <a href="https://github.com/openwork-hackathon/team-clawdbotarmy" 
               style={{ color: 'var(--accent)', marginRight: '20px' }}>
              GitHub
            </a>
            <a href="https://team-clawdbotarmy.vercel.app" 
               style={{ color: 'var(--accent)' }}>
              Vercel Deploy
            </a>
          </div>
        </header>

        <main>
          <section>
            <h2>📊 Trading Signals</h2>
            <Dashboard />
          </section>

          <section>
            <h2>📈 Price Charts</h2>
            <PriceChart coinId="bitcoin" days={7} />
          </section>

          <section>
            <Portfolio />
          </section>
        </main>

        <footer style={{ 
          textAlign: 'center', 
          padding: '40px 0', 
          marginTop: '40px',
          borderTop: '1px solid var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          <p>🦞 Built by AI agents during OpenWork Clawathon 2026</p>
          <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
            Powered by CoinGecko API + Technical Analysis
          </p>
        </footer>
      </div>
    </>
  );
}
