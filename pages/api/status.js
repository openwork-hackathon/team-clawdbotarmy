// Deployment Status API - Contract and infrastructure monitoring
// Built by beanbot for ClawdbotArmy

const CONTRACTS = {
  ARYA: {
    address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
    name: 'ARYA',
    type: 'ERC20',
    role: 'Platform governance & staking',
    deployer: 'AryaTheElf_v2'
  },
  BBOT: {
    address: '0x934d2c953Ab21fACCfeB88f832B800CA9E437b07',
    name: 'BBOT',
    type: 'ERC20',
    role: 'Backend operations token',
    deployer: 'beanbot'
  },
  BRAUM: {
    address: '0xefb28887A479029B065Cb931a973B97101209b07',
    name: 'BRAUM',
    type: 'ERC20',
    role: 'Warrior token (community)',
    deployer: 'MichaelScofield'
  },
  OPENWORK: {
    address: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
    name: 'OPENWORK',
    type: 'ERC20',
    role: 'Protocol utility',
    deployer: 'Team'
  },
  KROWNEPO: {
    address: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
    name: 'KROWNEPO',
    type: 'ERC20',
    role: 'Community token',
    deployer: 'Team'
  }
};

const INFRASTRUCTURE = {
  frontend: {
    url: 'https://team-clawdbotarmy.vercel.app',
    provider: 'Vercel',
    repo: 'github.com/openwork-hackathon/team-clawdbotarmy'
  },
  blockchain: {
    network: 'Base',
    chainId: 8453,
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org'
  },
  apis: {
    coingecko: 'https://api.coingecko.com/api/v3',
    internal: '/api'
  }
};

async function checkContractDeployed(address) {
  try {
    const response = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [address, 'latest'],
        id: 1
      }),
      signal: AbortSignal.timeout(3000)
    });
    
    const data = await response.json();
    const code = data.result;
    
    // '0x' means no contract deployed
    return code && code !== '0x' && code.length > 2;
  } catch (error) {
    return null; // Unknown status
  }
}

export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Check all contracts
  const contractStatuses = await Promise.all(
    Object.entries(CONTRACTS).map(async ([symbol, contract]) => {
      const deployed = await checkContractDeployed(contract.address);
      return {
        symbol,
        ...contract,
        deployed,
        explorerUrl: `${INFRASTRUCTURE.blockchain.explorer}/address/${contract.address}`
      };
    })
  );
  
  const response = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    platform: 'ClawdbotArmy',
    hackathon: 'OpenWork Clawathon 2026',
    team: {
      name: 'ClawdbotArmy',
      agents: ['AryaTheElf_v2', 'beanbot', 'MichaelScofield'],
      submitted: true
    },
    contracts: contractStatuses,
    infrastructure: INFRASTRUCTURE,
    metrics: {
      totalContracts: contractStatuses.length,
      deployedContracts: contractStatuses.filter(c => c.deployed === true).length,
      checkDuration: Date.now() - startTime
    },
    links: {
      platform: INFRASTRUCTURE.frontend.url,
      github: `https://${INFRASTRUCTURE.frontend.repo}`,
      explorer: INFRASTRUCTURE.blockchain.explorer,
      docs: `${INFRASTRUCTURE.frontend.url}/agent-guide`
    }
  };
  
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.status(200).json(response);
}
