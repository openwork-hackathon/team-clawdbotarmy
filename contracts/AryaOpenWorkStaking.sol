// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AryaOpenWorkStaking
 * @dev Staking contract for ARYA and OPENWORK tokens with multi-pool support
 * 
 * Features:
 * - Multiple staking pools (ARYA, OPENWORK)
 * - Variable lock periods (30, 60, 90 days)
 * - Different APY rates per pool and lock period
 * - Rewards distributed from staking pool
 */
contract AryaOpenWorkStaking is ReentrancyGuard, Ownable {
    
    IERC20 public aryaToken;
    IERC20 public openworkToken;
    IERC20 public rewardToken;
    
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
    mapping(uint256 => mapping(address => uint256)) public rewards;
    
    // Lock periods (in seconds)
    struct LockPeriod {
        uint256 duration;
        uint256 multiplier; // basis points (e.g., 12000 = 120%)
    }
    
    mapping(uint256 => LockPeriod[]) public lockPeriods;
    
    // User lock info
    struct StakeInfo {
        uint256 amount;
        uint256 lockPeriod;
        uint256 stakeTime;
        uint256 rewardDebt;
    }
    
    mapping(uint256 => mapping(address => StakeInfo)) public stakeInfo;
    
    uint256 public constant TOTAL_POOLS = 2;
    uint256 public constant ARYA_POOL = 0;
    uint256 public constant OPENWORK_POOL = 1;
    
    // Events
    event Staked(uint256 indexed pool, address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(uint256 indexed pool, address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(uint256 indexed pool, address indexed user, uint256 reward);
    event PoolUpdated(uint256 indexed pool, uint256 rewardRate);
    event RewardTokenSet(address indexed token);
    
    constructor(
        address _aryaToken,
        address _openworkToken,
        address _rewardToken
    ) {
        aryaToken = IERC20(_aryaToken);
        openworkToken = IERC20(_openworkToken);
        rewardToken = IERC20(_rewardToken);
        
        // Initialize pools
        pools[ARYA_POOL] = Pool({
            stakeToken: _aryaToken,
            totalStaked: 0,
            rewardRate: 0,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            active: true
        });
        
        pools[OPENWORK_POOL] = Pool({
            stakeToken: _openworkToken,
            totalStaked: 0,
            rewardRate: 0,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            active: true
        });
        
        // Lock periods (30, 60, 90 days)
        // Multiplier: 10000 = 100%, so 12000 = 120%
        lockPeriods[ARYA_POOL] = [
            LockPeriod({ duration: 30 days, multiplier: 10000 }),    // 30 days = 1x
            LockPeriod({ duration: 60 days, multiplier: 12000 }),    // 60 days = 1.2x
            LockPeriod({ duration: 90 days, multiplier: 15000 })     // 90 days = 1.5x
        ];
        
        lockPeriods[OPENWORK_POOL] = [
            LockPeriod({ duration: 30 days, multiplier: 10000 }),
            LockPeriod({ duration: 60 days, multiplier: 11000 }),
            LockPeriod({ duration: 90 days, multiplier: 13000 })
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
    
    function getReward(uint256 poolId, address user) public view returns (uint256) {
        Pool storage pool = pools[poolId];
        uint256 earned = (userStaked[poolId][user] * 
            (earnedPerToken(poolId) - userRewardPerTokenPaid[poolId][user]) / 1e18);
        
        // Apply lock period multiplier
        uint256 lockIndex = stakeInfo[poolId][user].lockPeriod;
        if (lockIndex < lockPeriods[poolId].length) {
            uint256 multiplier = lockPeriods[poolId][lockIndex].multiplier;
            earned = earned * multiplier / 10000;
        }
        
        return earned + rewards[poolId][user];
    }
    
    function stake(uint256 poolId, uint256 amount, uint256 lockPeriodIndex) external nonReentrant updatePool(poolId) {
        require(amount > 0, "Cannot stake 0");
        require(pools[poolId].active, "Pool not active");
        require(lockPeriodIndex < lockPeriods[poolId].length, "Invalid lock period");
        
        Pool storage pool = pools[poolId];
        
        // Transfer tokens from user
        require(IERC20(pool.stakeToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update rewards
        if (userStaked[poolId][msg.sender] > 0) {
            rewards[poolId][msg.sender] += getReward(poolId, msg.sender);
        }
        
        // Update stake info
        userStaked[poolId][msg.sender] += amount;
        stakeInfo[poolId][msg.sender] = StakeInfo({
            amount: amount,
            lockPeriod: lockPeriodIndex,
            stakeTime: block.timestamp,
            rewardDebt: 0
        });
        
        pool.totalStaked += amount;
        userRewardPerTokenPaid[poolId][msg.sender] = pool.rewardPerTokenStored;
        
        emit Staked(poolId, msg.sender, amount, lockPeriodIndex);
    }
    
    function unstake(uint256 poolId, uint256 amount) external nonReentrant updatePool(poolId) {
        require(amount > 0, "Cannot unstake 0");
        require(userStaked[poolId][msg.sender] >= amount, "Insufficient stake");
        
        Pool storage pool = pools[poolId];
        
        // Check lock period
        uint256 lockIndex = stakeInfo[poolId][msg.sender].lockPeriod;
        uint256 lockDuration = lockPeriods[poolId][lockIndex].duration;
        require(block.timestamp >= stakeInfo[poolId][msg.sender].stakeTime + lockDuration, "Lock period not over");
        
        // Calculate and claim rewards
        uint256 reward = getReward(poolId, msg.sender);
        rewards[poolId][msg.sender] = 0;
        
        // Update state
        userStaked[poolId][msg.sender] -= amount;
        pool.totalStaked -= amount;
        userRewardPerTokenPaid[poolId][msg.sender] = pool.rewardPerTokenStored;
        
        // Transfer staked tokens
        require(IERC20(pool.stakeToken).transfer(msg.sender, amount), "Transfer failed");
        
        // Transfer rewards
        if (reward > 0) {
            require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        }
        
        emit Unstaked(poolId, msg.sender, amount, reward);
    }
    
    function claimReward(uint256 poolId) external nonReentrant updatePool(poolId) {
        uint256 reward = getReward(poolId, msg.sender);
        require(reward > 0, "No reward to claim");
        
        rewards[poolId][msg.sender] = 0;
        userRewardPerTokenPaid[poolId][msg.sender] = pools[poolId].rewardPerTokenStored;
        
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardClaimed(poolId, msg.sender, reward);
    }
    
    function setPoolRewardRate(uint256 poolId, uint256 rewardRate) external onlyOwner {
        Pool storage pool = pools[poolId];
        pool.rewardRate = rewardRate;
        pool.lastUpdateTime = block.timestamp;
        emit PoolUpdated(poolId, rewardRate);
    }
    
    function setRewardToken(address _rewardToken) external onlyOwner {
        rewardToken = IERC20(_rewardToken);
        emit RewardTokenSet(_rewardToken);
    }
    
    function getAPY(uint256 poolId, uint256 lockPeriodIndex) external view returns (uint256) {
        if (lockPeriodIndex >= lockPeriods[poolId].length) return 0;
        
        uint256 multiplier = lockPeriods[poolId][lockPeriodIndex].multiplier;
        // APY = rewardRate * 365 days * multiplier
        // Returns basis points (10000 = 100%)
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
        uint256 rewardEarned,
        uint256 lockTimeRemaining,
        uint256 lockPeriodIndex
    ) {
        uint256 lockIdx = stakeInfo[poolId][user].lockPeriod;
        uint256 lockDuration = lockIdx < lockPeriods[poolId].length 
            ? lockPeriods[poolId][lockIdx].duration 
            : 30 days;
        
        uint256 stakeTime = stakeInfo[poolId][user].stakeTime;
        uint256 timeRemaining = stakeTime + lockDuration > block.timestamp
            ? stakeTime + lockDuration - block.timestamp
            : 0;
            
        return (
            userStaked[poolId][user],
            getReward(poolId, user),
            timeRemaining,
            lockIdx
        );
    }
    
    receive() external payable {}
}
