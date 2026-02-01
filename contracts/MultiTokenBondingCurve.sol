// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiTokenBondingCurve
 * @dev Unified bonding curve contract for multiple AI agent tokens
 * 
 * Supports: ARYA, OPENWORK, and custom tokens
 * 
 * Formula: price = a * supply + b
 * 
 * Parameters per token:
 * - ARYA:   a=0.00001, b=0.0001, max=10M
 * - OPENWORK: a=0.000001, b=0.0001, max=50M
 */
contract MultiTokenBondingCurve is ReentrancyGuard, Ownable {
    
    struct TokenConfig {
        address tokenAddress;
        uint256 a;      // Slope
        uint256 b;      // Base price
        uint256 maxSupply;
        uint256 initialSupply;
        uint256 migrationThreshold;
    }
    
    mapping(string => TokenConfig) public tokenConfigs;
    mapping(string => uint256) public tokenSupply;
    mapping(string => uint256) public ethReserve;
    mapping(string => uint256) public totalTrades;
    mapping(string => uint256) public totalVolume;
    mapping(string => bool) public migrationEnabled;
    mapping(string => address) public uniswapPool;
    mapping(string => bool) public migrated;
    
    // Events
    event Buy(string indexed token, address indexed user, uint256 ethAmount, uint256 tokenAmount, uint256 price);
    event Sell(string indexed token, address indexed user, uint256 tokenAmount, uint256 ethAmount, uint256 price);
    event TokenConfigAdded(string token, address tokenAddress, uint256 a, uint256 b, uint256 maxSupply);
    event MigrationEnabled(string token, address pool);
    event Migrated(string token, address pool, uint256 reserve, uint256 supply);
    
    constructor() {
        // Configure ARYA
        tokenConfigs["ARYA"] = TokenConfig({
            tokenAddress: 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07,
            a: 0.00001 ether,
            b: 0.0001 ether,
            maxSupply: 10000000 * 10**18,
            initialSupply: 1000000 * 10**18,
            migrationThreshold: 75 ether
        });
        tokenSupply["ARYA"] = tokenConfigs["ARYA"].initialSupply;
        
        // Configure OPENWORK (not yet deployed - placeholder)
        tokenConfigs["OPENWORK"] = TokenConfig({
            tokenAddress: address(0), // To be set
            a: 0.000001 ether,
            b: 0.0001 ether,
            maxSupply: 50000000 * 10**18,
            initialSupply: 5000000 * 10**18,
            migrationThreshold: 50 ether
        });
        tokenSupply["OPENWORK"] = tokenConfigs["OPENWORK"].initialSupply;
    }
    
    /**
     * @dev Add or update token configuration
     */
    function addTokenConfig(
        string calldata token,
        address tokenAddress,
        uint256 a,
        uint256 b,
        uint256 maxSupply,
        uint256 initialSupply,
        uint256 migrationThreshold
    ) external onlyOwner {
        tokenConfigs[token] = TokenConfig({
            tokenAddress: tokenAddress,
            a: a,
            b: b,
            maxSupply: maxSupply,
            initialSupply: initialSupply,
            migrationThreshold: migrationThreshold
        });
        
        if (tokenSupply[token] == 0) {
            tokenSupply[token] = initialSupply;
        }
        
        emit TokenConfigAdded(token, tokenAddress, a, b, maxSupply);
    }
    
    /**
     * @dev Get current price for a token
     */
    function getPrice(string calldata token) public view returns (uint256) {
        TokenConfig storage config = tokenConfigs[token];
        return config.a * tokenSupply[token] + config.b;
    }
    
    /**
     * @dev Calculate tokens received for ETH amount
     */
    function getTokensForEth(string calldata token, uint256 ethAmount) public view returns (uint256) {
        require(ethAmount > 0, "Must send ETH");
        TokenConfig storage config = tokenConfigs[token];
        uint256 avgPrice = (getPrice(token) + (config.a * (tokenSupply[token] + 1) + config.b)) / 2;
        return ethAmount / avgPrice;
    }
    
    /**
     * @dev Buy tokens with ETH
     */
    function buy(string calldata token, uint256 minTokens) external payable returns (uint256) {
        require(msg.value > 0, "Must send ETH");
        TokenConfig storage config = tokenConfigs[token];
        require(config.tokenAddress != address(0), "Token not configured");
        
        uint256 supply = tokenSupply[token];
        require(supply < config.maxSupply, "Max supply reached");
        
        uint256 tokensToBuy = getTokensForEth(token, msg.value);
        require(supply + tokensToBuy <= config.maxSupply, "Exceeds max supply");
        require(tokensToBuy >= minTokens, "Slippage exceeded");
        
        uint256 avgPrice = (getPrice(token) + (config.a * (supply + tokensToBuy) + config.b)) / 2;
        
        // Transfer tokens to buyer
        require(IERC20(config.tokenAddress).transfer(msg.sender, tokensToBuy), "Transfer failed");
        
        // Update state
        tokenSupply[token] += tokensToBuy;
        ethReserve[token] += msg.value;
        totalTrades[token]++;
        totalVolume[token] += msg.value;
        
        emit Buy(token, msg.sender, msg.value, tokensToBuy, avgPrice);
        
        return tokensToBuy;
    }
    
    /**
     * @dev Sell tokens for ETH
     */
    function sell(string calldata token, uint256 tokenAmount, uint256 minEth) external returns (uint256) {
        require(tokenAmount > 0, "Must send tokens");
        TokenConfig storage config = tokenConfigs[token];
        require(config.tokenAddress != address(0), "Token not configured");
        
        uint256 supply = tokenSupply[token];
        require(tokenAmount < supply, "Cannot sell all");
        
        uint256 avgPrice = (getPrice(token) + (config.a * (supply - tokenAmount) + config.b)) / 2;
        uint256 ethToReceive = tokenAmount * avgPrice;
        
        require(ethToReceive >= minEth, "Slippage exceeded");
        require(ethReserve[token] >= ethToReceive, "Insufficient reserves");
        
        // Transfer tokens from seller
        require(IERC20(config.tokenAddress).transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        
        // Send ETH to seller
        payable(msg.sender).transfer(ethToReceive);
        
        // Update state
        tokenSupply[token] -= tokenAmount;
        ethReserve[token] -= ethToReceive;
        totalTrades[token]++;
        totalVolume[token] += ethToReceive;
        
        emit Sell(token, msg.sender, tokenAmount, ethToReceive, avgPrice);
        
        return ethToReceive;
    }
    
    /**
     * @dev Enable migration for a token
     */
    function enableMigration(string calldata token, address _uniswapPool) external onlyOwner {
        require(!migrated[token], "Already migrated");
        uniswapPool[token] = _uniswapPool;
        migrationEnabled[token] = true;
        emit MigrationEnabled(token, _uniswapPool);
    }
    
    /**
     * @dev Migrate reserves to Uniswap V4
     */
    function migrate(string calldata token) external onlyOwner {
        TokenConfig storage config = tokenConfigs[token];
        require(migrationEnabled[token], "Migration not enabled");
        require(!migrated[token], "Already migrated");
        require(tokenSupply[token] >= config.migrationThreshold, "Threshold not reached");
        
        migrated[token] = true;
        
        // Transfer remaining tokens to pool
        uint256 balance = IERC20(config.tokenAddress).balanceOf(address(this));
        if (balance > 0) {
            IERC20(config.tokenAddress).transfer(uniswapPool[token], balance);
        }
        
        // Transfer ETH reserves
        if (address(this).balance > 0) {
            payable(uniswapPool[token]).transfer(address(this).balance);
        }
        
        emit Migrated(token, uniswapPool[token], ethReserve[token], tokenSupply[token]);
    }
    
    /**
     * @dev Get contract info for a token
     */
    function getInfo(string calldata token) external view returns (
        uint256 _supply,
        uint256 _ethReserve,
        uint256 _currentPrice,
        uint256 _totalTrades,
        uint256 _totalVolume,
        bool _migrated
    ) {
        return (
            tokenSupply[token],
            ethReserve[token],
            getPrice(token),
            totalTrades[token],
            totalVolume[token],
            migrated[token]
        );
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
