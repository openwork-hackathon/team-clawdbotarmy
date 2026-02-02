// Staking API endpoints for ARYA and OPENWORK
// Pool data from contracts

const stakingData = {
  pools: {
    ARYA: {
      totalStaked: 1250000,
      apy: { 30: 25, 60: 30, 90: 45 },
      lockPeriods: [30, 60, 90]
    },
    OPENWORK: {
      totalStaked: 3500000,
      apy: { 30: 20, 60: 24, 90: 32 },
      lockPeriods: [30, 60, 90]
    }
  },
  userStakes: {}
};

export default async function handler(req, res) {
  const { method, query, body } = req;
  
  if (method === 'GET') {
    const { pool, user } = query;
    
    if (pool && user) {
      const userKey = `${user.toLowerCase()}_${pool}`;
      const stake = stakingData.userStakes[userKey] || null;
      return res.status(200).json(stake);
    }
    
    if (pool) {
      const poolData = stakingData.pools[pool.toUpperCase()];
      if (!poolData) {
        return res.status(404).json({ error: 'Pool not found' });
      }
      return res.status(200).json(poolData);
    }
    
    return res.status(200).json(stakingData.pools);
  }
  
  if (method === 'POST') {
    const { action, pool, user, amount, lockPeriod } = body;
    
    if (!action || !pool || !user) {
      return res.status(400).json({ error: 'Missing action, pool, or user' });
    }
    
    const userKey = `${user.toLowerCase()}_${pool.toUpperCase()}`;
    
    try {
      switch (action) {
        case 'stake':
          if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
          }
          
          stakingData.userStakes[userKey] = {
            ...stakingData.userStakes[userKey],
            stakedAmount: (stakingData.userStakes[userKey]?.stakedAmount || 0) + amount,
            lockPeriod: lockPeriod || 0,
            stakeTime: Date.now(),
            lastClaimTime: Date.now()
          };
          
          stakingData.pools[pool.toUpperCase()].totalStaked += amount;
          
          return res.status(200).json({
            success: true,
            action: 'stake',
            amount,
            stakedAmount: stakingData.userStakes[userKey].stakedAmount
          });
          
        case 'unstake':
          const currentStake = stakingData.userStakes[userKey];
          if (!currentStake || currentStake.stakedAmount <= 0) {
            return res.status(400).json({ error: 'No stake to unstake' });
          }
          
          const unstakeAmount = amount || currentStake.stakedAmount;
          
          const lockDuration = [30, 60, 90][currentStake.lockPeriod || 0] * 24 * 60 * 60 * 1000;
          if (Date.now() - currentStake.stakeTime < lockDuration) {
            return res.status(400).json({ 
              error: 'Lock period not over',
              timeRemaining: lockDuration - (Date.now() - currentStake.stakeTime)
            });
          }
          
          stakingData.userStakes[userKey].stakedAmount -= unstakeAmount;
          stakingData.pools[pool.toUpperCase()].totalStaked -= unstakeAmount;
          
          return res.status(200).json({
            success: true,
            action: 'unstake',
            amount: unstakeAmount,
            remainingStake: stakingData.userStakes[userKey].stakedAmount
          });
          
        case 'claim':
          const stakeInfo = stakingData.userStakes[userKey];
          if (!stakeInfo || stakeInfo.stakedAmount <= 0) {
            return res.status(400).json({ error: 'No stake to claim rewards for' });
          }
          
          const poolConfig = stakingData.pools[pool.toUpperCase()];
          const multiplier = [1.0, 1.2, 1.5][stakeInfo.lockPeriod || 0];
          const daysStaked = (Date.now() - (stakeInfo.lastClaimTime || stakeInfo.stakeTime)) / (24 * 60 * 60 * 1000);
          const reward = stakeInfo.stakedAmount * (poolConfig.apy[30] / 100 / 365) * daysStaked * multiplier;
          
          stakingData.userStakes[userKey].lastClaimTime = Date.now();
          
          return res.status(200).json({
            success: true,
            action: 'claim',
            reward: reward.toFixed(6)
          });
          
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
