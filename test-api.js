const { getMarketChart } = require('./src/api/market');

async function test() {
  console.log('Testing 1h timeframe...');
  const prices1h = await getMarketChart('bitcoin', 7, '1h');
  console.log('1h prices count:', prices1h.length);
  console.log('First price timestamp:', new Date(prices1h[0]?.[0]).toISOString());
  
  console.log('\nTesting 1d timeframe...');
  const prices1d = await getMarketChart('bitcoin', 7, '1d');
  console.log('1d prices count:', prices1d.length);
  console.log('First price timestamp:', new Date(prices1d[0]?.[0]).toISOString());
  
  console.log('\nTimeframes return same data?', 
    prices1h[0]?.[0] === prices1d[0]?.[0] ? 'YES - BUG!' : 'NO - Working correctly');
}

test().catch(console.error);
