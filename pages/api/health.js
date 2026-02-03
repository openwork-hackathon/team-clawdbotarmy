// System Health Check - Production monitoring endpoint
// Built by beanbot for ClawdbotArmy ops

export default async function handler(req, res) {
  const startTime = Date.now();
  const checks = {};
  
  // 1. CoinGecko API health
  try {
    const cgResponse = await fetch(
      'https://api.coingecko.com/api/v3/ping',
      { signal: AbortSignal.timeout(3000) }
    );
    checks.coingecko = {
      status: cgResponse.ok ? 'healthy' : 'degraded',
      latency: Date.now() - startTime,
      endpoint: 'api.coingecko.com'
    };
  } catch (error) {
    checks.coingecko = {
      status: 'down',
      error: error.message,
      endpoint: 'api.coingecko.com'
    };
  }
  
  // 2. Base RPC health
  try {
    const rpcStart = Date.now();
    const rpcResponse = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
      signal: AbortSignal.timeout(3000)
    });
    const rpcData = await rpcResponse.json();
    checks.baseRpc = {
      status: rpcData.result ? 'healthy' : 'degraded',
      latency: Date.now() - rpcStart,
      blockNumber: parseInt(rpcData.result, 16),
      endpoint: 'mainnet.base.org'
    };
  } catch (error) {
    checks.baseRpc = {
      status: 'down',
      error: error.message,
      endpoint: 'mainnet.base.org'
    };
  }
  
  // 3. Internal API checks
  const internalChecks = [
    { name: 'price-all', path: '/api/price/all' },
    { name: 'staking', path: '/api/staking' },
    { name: 'analytics', path: '/api/analytics' }
  ];
  
  for (const check of internalChecks) {
    try {
      const checkStart = Date.now();
      const baseUrl = req.headers.host 
        ? `https://${req.headers.host}` 
        : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}${check.path}`, {
        signal: AbortSignal.timeout(5000)
      });
      checks[check.name] = {
        status: response.ok ? 'healthy' : 'degraded',
        latency: Date.now() - checkStart,
        statusCode: response.status
      };
    } catch (error) {
      checks[check.name] = {
        status: 'down',
        error: error.message
      };
    }
  }
  
  // Overall system status
  const allHealthy = Object.values(checks).every(
    c => c.status === 'healthy'
  );
  const anyDown = Object.values(checks).some(
    c => c.status === 'down'
  );
  
  const overallStatus = allHealthy 
    ? 'healthy' 
    : anyDown 
      ? 'degraded' 
      : 'partial';
  
  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    checks,
    summary: {
      total: Object.keys(checks).length,
      healthy: Object.values(checks).filter(c => c.status === 'healthy').length,
      degraded: Object.values(checks).filter(c => c.status === 'degraded').length,
      down: Object.values(checks).filter(c => c.status === 'down').length
    }
  };
  
  // Return appropriate HTTP status
  const httpStatus = allHealthy ? 200 : anyDown ? 503 : 207;
  
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(httpStatus).json(response);
}
