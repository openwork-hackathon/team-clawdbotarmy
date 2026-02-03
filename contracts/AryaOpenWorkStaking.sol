// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AryaOpenWorkStaking
 * @dev Staking contract with 50/50 rewards in ARYA + OPENWORK tokens
 * 
 * Features:
 * - Multiple staking pools (ARYA, OPENWORK)
 * - Rewards paid 50% ARYA + 50% OPENWORK
 * - Variable lock periods (30, 60, 90 days)
 * - Different APY rates per pool
 */
contract AryaOpenWorkStaking is ReentrancyGuard, Ownable {
    
    IERC20 public aryaToken;
    IERC20 public openworkToken;
    
    // Pool configuration
    struct Pool {
        address stakeToken;
        uint256 totalStaked;
        uint256 rewardRate; // Rewards per second per 1e18 staked
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        bool active;
    }
    
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => uint256)) public userStaked;
    mapping(uint256 => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(uint256 => mapping(address => uint256)) public rewardsArya;
    mapping(uint256 => mapping(address => uint256)) public rewardsOpenwork;
    
    // Lock periods (in seconds)
    struct LockPeriod {
        uint256 duration;
        uint256 multiplier; // basis points (e.g., 12000 = 120%)
    }
    
    mapping(uint256 => LockPeriod[]) public lockPeriods;
    
    // User stake info
    struct StakeInfo {
        uint256 amount;
        uint256 lockPeriod;
        uint256 stakeTime;
    }
    
    mapping(uint256 => mapping(address => StakeInfo)) public stakeInfo;
    
    uint256 public constant ARYA_POOL = 0;
    uint256 public constant OPENWORK_POOL = 1;
    
    // Events
    event Staked(uint256 indexed pool, address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(uint256 indexed pool, address indexed user, uint256 amount, uint256 rewardArya, uint256 rewardOpenwork);
    event RewardClaimed(uint256 indexed pool, address indexed user, uint256 rewardArya, uint256 rewardOpenwork);
    event PoolUpdated(uint256 indexed pool, uint256 rewardRate);
    
    constructor(
        address _aryaToken,
        address _openworkToken
    ) {
        aryaToken = IERC20(_aryaToken);
        openworkToken = IERC20(_openworkToken);
        
        // Initialize ARYA pool
        pools[ARYA_POOL] = Pool({
            stakeToken: _aryaToken,
            totalStaked: 0,
            rewardRate: 0,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            active: true
        });
        
        // Initialize OPENWORK pool
        pools[OPENWORK_POOL] = Pool({
            stakeToken: _openworkToken,
            totalStaked: 0,
            rewardRate: 0,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            active: true
        });
        
        // Lock periods with multipliers
        // 10000 = 100%, so 15000 = 150% rewards
        lockPeriods[ARYA_POOL] = [
            LockPeriod({ duration: 30 days, multiplier: 10000 }),    // 30 days = 1x
            LockPeriod({ duration: 60 days, multiplier: 13000 }),    // 60 days = 1.3x
            LockPeriod({ duration: 90 days, multiplier: 16000 })     // 90 days = 1.6x
        ];
        
        lockPeriods[OPENWORK_POOL] = [
            LockPeriod({ duration: 30 days, multiplier: 10000 }),
            LockPeriod({ duration: 60 days, multiplier: 12000 }),
            LockPeriod({ duration: 90 days, multiplier: 14000 })
        ];
    }
    
    modifier updatePool(uint256 poolId) {
        Pool storage pool = pools[poolId];
        if (pool.totalStaked > 0) {
            pool.rewardPerTokenStored = earnedPerToken(poolId);
            pool.lastUpdateTime = block.timestamp;
        }
        _;
    }
    
    function earnedPerToken(uint256 poolId) public view returns (uint256) {
        Pool storage pool = pools[poolId];
        if (pool.totalStaked == 0) {
            return pool.rewardPerTokenStored;
        }
        return pool.rewardPerTokenStored + (
            (block.timestamp - pool.lastUpdateTime) * pool.rewardRate / 1e18
        );
    }
    
    function getRewards(uint256 poolId, address user) public view returns (uint256 rewardArya, uint256 rewardOpenwork) {
        Pool storage pool = pools[poolId];
        uint256 earned = (userStaked[poolId][user] * 
            (earnedPerToken(poolId) - userRewardPerTokenPaid[poolId][user]) / 1e18);
        
        // Apply lock period multiplier
        uint256 lockIndex = stakeInfo[poolId][user].lockPeriod;
        uint256 multiplier = 10000;
        if (lockIndex < lockPeriods[poolId].length) {
            multiplier = lockPeriods[poolId][lockIndex].multiplier;
        }
        earned = earned * multiplier / 10000;
        
        // Split 50/50 between ARYA and OPENWORK
        rewardArya = earned / 2;
        rewardOpenwork = earned - rewardArya;
        
        return (rewardArya + rewardsArya[poolId][user], rewardOpenwork + rewardsOpenwork[poolId][user]);
    }
    
    function stake(uint256 poolId, uint256 amount, uint256 lockPeriodIndex) 
        external 
        nonReentrant 
        updatePool(poolId) 
    {
        require(amount > 0, "Cannot stake 0");
        require(pools[poolId].active, "Pool not active");
        require(lockPeriodIndex < lockPeriods[poolId].length, "Invalid lock period");
        
        Pool storage pool = pools[poolId];
        
        // Transfer tokens from user
        require(IERC20(pool.stakeToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Claim pending rewards
        if (userStaked[poolId][msg.sender] > 0) {
            (uint256 pendingArya, uint256 pendingOpenwork) = getRewards(poolId, msg.sender);
            if (pendingArya > 0 || pendingOpenwork > 0) {
                rewardsArya[poolId][msg.sender] = 0;
                rewardsOpenwork[poolId][msg.sender] = 0;
                if (pendingArya > 0) require(aryaToken.transfer(msg.sender, pendingArya), "ARYA reward transfer failed");
                if (pendingOpenwork > 0) require(openworkToken.transfer(msg.sender, pendingOpenwork), "OPENWORK reward transfer failed");
            }
        }
        
        // Update stake
        userStaked[poolId][msg.sender] += amount;
        stakeInfo[poolId][msg.sender] = StakeInfo({
            amount: amount,
            lockPeriod: lockPeriodIndex,
            stakeTime: block.timestamp
        });
        
        pool.totalStaked += amount;
        userRewardPerTokenPaid[poolId][msg.sender] = pool.rewardPerTokenStored;
        
        emit Staked(poolId, msg.sender, amount, lockPeriodIndex);
    }
    
    function unstake(uint256 poolId, uint256 amount) 
        external 
        nonReentrant 
        updatePool(poolId) 
    {
        require(amount > 0, "Cannot unstake 0");
        require(userStaked[poolId][msg.sender] >= amount, "Insufficient stake");
        
        Pool storage pool = pools[poolId];
        
        // Check lock period
        uint256 lockIndex = stakeInfo[poolId][msg.sender].lockPeriod;
        uint256 lockDuration = lockPeriods[poolId][lockIndex].duration;
        require(block.timestamp >= stakeInfo[poolId][msg.sender].stakeTime + lockDuration, "Lock period not over");
        
        // Calculate rewards
        (uint256 rewardArya, uint256 rewardOpenwork) = getRewards(poolId, msg.sender);
        rewardsArya[poolId][msg.sender] = 0;
        rewardsOpenwork[poolId][msg.sender] = 0;
        
        // Update state
        userStaked[poolId][msg.sender] -= amount;
        pool.totalStaked -= amount;
        userRewardPerTokenPaid[poolId][msg.sender] = pool.rewardPerTokenStored;
        
        // Transfer staked tokens
        require(IERC20(pool.stakeToken).transfer(msg.sender, amount), "Transfer failed");
        
        // Transfer rewards (50/50 split)
        if (rewardArya > 0) require(aryaToken.transfer(msg.sender, rewardArya), "ARYA reward failed");
        if (rewardOpenwork > 0) require(openworkToken.transfer(msg.sender, rewardOpenwork), "OPENWORK reward failed");
        
        emit Unstaked(poolId, msg.sender, amount, rewardArya, rewardOpenwork);
    }
    
    function claimReward(uint256 poolId) 
        external 
        nonReentrant 
        updatePool(poolId) 
    {
        (uint256 rewardArya, uint256 rewardOpenwork) = getRewards(poolId, msg.sender);
        require(rewardArya > 0 || rewardOpenwork > 0, "No rewards to claim");
        
        rewardsArya[poolId][msg.sender] = 0;
        rewardsOpenwork[poolId][msg.sender] = 0;
        userRewardPerTokenPaid[poolId][msg.sender] = pools[poolId].rewardPerTokenStored;
        
        if (rewardArya > 0) require(aryaToken.transfer(msg.sender, rewardArya), "ARYA transfer failed");
        if (rewardOpenwork > 0) require(openworkToken.transfer(msg.sender, rewardOpenwork), "OPENWORK transfer failed");
        
        emit RewardClaimed(poolId, msg.sender, rewardArya, rewardOpenwork);
    }
    
    function setPoolRewardRate(uint256 poolId, uint256 rewardRate) external onlyOwner {
        Pool storage pool = pools[poolId];
        pool.rewardRate = rewardRate;
        pool.lastUpdateTime = block.timestamp;
        emit PoolUpdated(poolId, rewardRate);
    }
    
    function getAPY(uint256 poolId, uint256 lockPeriodIndex) external view returns (uint256) {
        if (lockPeriodIndex >= lockPeriods[poolId].length) return 0;
        uint256 multiplier = lockPeriods[poolId][lockPeriodIndex].multiplier;
        return pools[poolId].rewardRate * 365 days * multiplier / 1e18;
    }
    
    function getPoolInfo(uint256 poolId) external view returns (
        uint256 totalStaked,
        uint256 apy30,
        uint256 apy60,
        uint256 apy90,
        bool active
    ) {
        Pool storage pool = pools[poolId];
        return (
            pool.totalStaked,
            getAPY(poolId, 0),
            getAPY(poolId, 1),
            getAPY(poolId, 2),
            pool.active
        );
    }
    
    function getUserInfo(uint256 poolId, address user) external view returns (
        uint256 stakedAmount,
        uint256 rewardArya,
        uint256 rewardOpenwork,
        uint256 lockTimeRemaining
    ) {
        uint256 lockIdx = stakeInfo[poolId][user].lockPeriod;
        uint256 lockDuration = lockIdx < lockPeriods[poolId].length 
            ? lockPeriods[poolId][lockIdx].duration 
            : 30 days;
        
        uint256 stakeTime = stakeInfo[poolId][user].stakeTime;
        uint256 timeRemaining = stakeTime + lockDuration > block.timestamp
            ? stakeTime + lockDuration - block.timestamp
            : 0;
            
        (uint256 rArya, uint256 rOpenwork) = getRewards(poolId, user);
        
        return (
            userStaked[poolId][user],
            rArya,
            rOpenwork,
            timeRemaining
        );
    }
    
    function fundRewards(uint256 aryaAmount, uint256 openworkAmount) external onlyOwner {
        require(aryaToken.transferFrom(msg.sender, address(this), aryaAmount), "ARYA funding failed");
        require(openworkToken.transferFrom(msg.sender, address(this), openworkAmount), "OPENWORK funding failed");
    }
    
    receive() external payable {}
}
