// Operations Dashboard - System health and metrics
// Built by beanbot for ClawdbotArmy backend ops

import { useEffect, useState } from 'react';

export default function OpsDashboard() {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [healthRes, statusRes, metricsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/status'),
        fetch('/api/metrics?detailed=true')
      ]);

      setHealth(await healthRes.json());
      setStatus(await statusRes.json());
      setMetrics(await metricsRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch ops data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>🔧 Loading Operations Dashboard...</h1>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': case 'operational': return '#00ff00';
      case 'degraded': case 'partial': return '#ffaa00';
      case 'down': return '#ff0000';
      default: return '#888';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#0a0a0a', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ borderBottom: '2px solid #0f0', paddingBottom: '10px' }}>
        🫘 ClawdbotArmy Operations Dashboard
      </h1>
      <p style={{ color: '#888', fontSize: '12px', marginBottom: '30px' }}>
        Real-time system health, metrics, and deployment status • Built by beanbot
      </p>

      {/* System Health */}
      <section style={{ marginBottom: '30px', border: '1px solid #0f0', padding: '15px' }}>
        <h2 style={{ color: '#0ff', marginTop: 0 }}>⚡ System Health</h2>
        {health && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <strong>Overall Status:</strong>{' '}
              <span style={{ color: getStatusColor(health.status), fontWeight: 'bold' }}>
                {health.status.toUpperCase()}
              </span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Summary:</strong> {health.summary.healthy}/{health.summary.total} services healthy
              {health.summary.down > 0 && ` • ${health.summary.down} down`}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0f0' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Service</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Latency</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(health.checks).map(([name, check]) => (
                  <tr key={name} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '5px' }}>{name}</td>
                    <td style={{ padding: '5px', color: getStatusColor(check.status) }}>
                      {check.status}
                    </td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>
                      {check.latency ? `${check.latency}ms` : '-'}
                    </td>
                    <td style={{ padding: '5px', fontSize: '11px', color: '#888' }}>
                      {check.endpoint || check.error || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* Deployed Contracts */}
      <section style={{ marginBottom: '30px', border: '1px solid #0f0', padding: '15px' }}>
        <h2 style={{ color: '#0ff', marginTop: 0 }}>📜 Deployed Contracts</h2>
        {status && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <strong>Chain:</strong> {status.infrastructure.blockchain.network} (Chain ID: {status.infrastructure.blockchain.chainId})
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0f0' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Token</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Address</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Role</th>
                  <th style={{ textAlign: 'center', padding: '5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {status.contracts.map((contract) => (
                  <tr key={contract.symbol} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '5px', fontWeight: 'bold' }}>{contract.symbol}</td>
                    <td style={{ padding: '5px', fontSize: '11px', fontFamily: 'monospace' }}>
                      <a 
                        href={contract.explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#0ff', textDecoration: 'none' }}
                      >
                        {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                      </a>
                    </td>
                    <td style={{ padding: '5px', fontSize: '11px', color: '#888' }}>
                      {contract.role}
                    </td>
                    <td style={{ padding: '5px', textAlign: 'center' }}>
                      {contract.deployed === true ? (
                        <span style={{ color: '#0f0' }}>✓ Deployed</span>
                      ) : contract.deployed === false ? (
                        <span style={{ color: '#f00' }}>✗ Not Found</span>
                      ) : (
                        <span style={{ color: '#888' }}>? Unknown</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* Platform Metrics */}
      <section style={{ marginBottom: '30px', border: '1px solid #0f0', padding: '15px' }}>
        <h2 style={{ color: '#0ff', marginTop: 0 }}>📊 Platform Metrics</h2>
        {metrics && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Uptime</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.uptime.formatted}</div>
              </div>
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Total Requests</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.api.totalRequests.toLocaleString()}</div>
              </div>
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Avg Response</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.api.avgResponseTime}</div>
              </div>
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Error Rate</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.api.errorRate}</div>
              </div>
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Unique Wallets</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.business.uniqueWallets.toLocaleString()}</div>
              </div>
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Total Staked</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${Number(metrics.business.totalStaked).toLocaleString()}</div>
              </div>
            </div>
          </>
        )}
      </section>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333', fontSize: '11px', color: '#888', textAlign: 'center' }}>
        ClawdbotArmy Operations Dashboard • Built by beanbot 🫘 • Auto-refreshes every 30s
      </footer>
    </div>
  );
}
