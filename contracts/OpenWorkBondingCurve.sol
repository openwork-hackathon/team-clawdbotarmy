// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OpenWorkBondingCurve
 * @dev Linear bonding curve for OPENWORK token on Base
 * 
 * Formula: price = a * supply + b
 * 
 * Buy: User sends ETH → receives OPENWORK
 * Sell: User sends OPENWORK → receives ETH
 * 
 * At threshold, can migrate to Uniswap V4 pool
 */
contract OpenWorkBondingCurve is ReentrancyGuard, Ownable {
    
    IERC20 public openworkToken;
    
    // Curve parameters - gentler slope for larger supply
    uint256 public constant A = 0.000001 ether;  // Slope (gentler than ARYA)
    uint256 public constant B = 0.0001 ether;    // Base price
    uint256 public constant MAX_SUPPLY = 50000000 * 10**18; // 50M tokens
    
    // State
    uint256 public totalSupply;
    uint256 public ethReserve;
    uint256 public totalTrades;
    uint256 public totalVolume;
    
    // Migration config
    bool public migrationEnabled;
    address public uniswapPool;
    uint256 public migrationThreshold = 50 ether; // 50 ETH threshold
    bool public migrated;
    
    // Events
    event Buy(address indexed user, uint256 ethAmount, uint256 tokenAmount, uint256 price);
    event Sell(address indexed user, uint256 tokenAmount, uint256 ethAmount, uint256 price);
    event MigrationEnabled(address pool);
    event Migrated(address pool, uint256 reserve, uint256 supply);
    
    constructor(address _openworkToken) {
        openworkToken = IERC20(_openworkToken);
        totalSupply = 5000000 * 10**18; // Initial supply 5M
    }
    
    /**
     * @dev Get current price from bonding curve
     * price = a * supply + b
     */
    function getPrice(uint256 supply) public view returns (uint256) {
        return A * supply + B;
    }
    
    /**
     * @dev Get average price for buying amount
     */
    function getAveragePrice(uint256 supply, uint256 delta) public pure returns (uint256) {
        uint256 startPrice = A * supply + B;
        uint256 endPrice = A * (supply + delta) + B;
        return (startPrice + endPrice) / 2;
    }
    
    /**
     * @dev Calculate tokens received for ETH amount
     */
    function getTokensForEth(uint256 ethAmount) public view returns (uint256) {
        require(ethAmount > 0, "Must send ETH");
        uint256 avgPrice = getAveragePrice(totalSupply, 0);
        return ethAmount / avgPrice;
    }
    
    /**
     * @dev Calculate ETH received for token amount
     */
    function getEthForTokens(uint256 tokenAmount) public view returns (uint256) {
        require(tokenAmount > 0, "Must send tokens");
        require(tokenAmount <= totalSupply, "Exceeds supply");
        uint256 avgPrice = getAveragePrice(totalSupply - tokenAmount, tokenAmount);
        return tokenAmount * avgPrice;
    }
    
    /**
     * @dev Buy OPENWORK with ETH
     */
    function buy(uint256 minTokens) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Must send ETH");
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokensToBuy = getTokensForEth(msg.value);
        require(totalSupply + tokensToBuy <= MAX_SUPPLY, "Exceeds max supply");
        require(tokensToBuy >= minTokens, "Slippage exceeded");
        
        uint256 avgPrice = getAveragePrice(totalSupply, tokensToBuy);
        
        // Transfer tokens to buyer
        require(openworkToken.transfer(msg.sender, tokensToBuy), "Transfer failed");
        
        // Update state
        totalSupply += tokensToBuy;
        ethReserve += msg.value;
        totalTrades++;
        totalVolume += msg.value;
        
        emit Buy(msg.sender, msg.value, tokensToBuy, avgPrice);
        
        return tokensToBuy;
    }
    
    /**
     * @dev Sell OPENWORK for ETH
     */
    function sell(uint256 tokenAmount, uint256 minEth) external nonReentrant returns (uint256) {
        require(tokenAmount > 0, "Must send tokens");
        require(tokenAmount < totalSupply, "Cannot sell all");
        
        uint256 ethToReceive = getEthForTokens(tokenAmount);
        require(ethToReceive >= minEth, "Slippage exceeded");
        require(ethReserve >= ethToReceive, "Insufficient reserves");
        
        // Transfer tokens from seller
        require(openworkToken.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        
        // Send ETH to seller
        payable(msg.sender).transfer(ethToReceive);
        
        // Update state
        totalSupply -= tokenAmount;
        ethReserve -= ethToReceive;
        totalTrades++;
        totalVolume += ethToReceive;
        
        emit Sell(msg.sender, tokenAmount, ethToReceive, ethToReceive / tokenAmount);
        
        return ethToReceive;
    }
    
    /**
     * @dev Enable migration to Uniswap V4 pool
     */
    function enableMigration(address _uniswapPool) external onlyOwner {
        require(!migrated, "Already migrated");
        uniswapPool = _uniswapPool;
        migrationEnabled = true;
        emit MigrationEnabled(_uniswapPool);
    }
    
    /**
     * @dev Migrate reserves to Uniswap V4 pool
     */
    function migrate() external onlyOwner {
        require(migrationEnabled, "Migration not enabled");
        require(!migrated, "Already migrated");
        require(totalSupply >= migrationThreshold, "Threshold not reached");
        
        migrated = true;
        
        // Transfer remaining OPENWORK to pool
        uint256 openworkBalance = openworkToken.balanceOf(address(this));
        if (openworkBalance > 0) {
            openworkToken.transfer(uniswapPool, openworkBalance);
        }
        
        // Transfer ETH reserves to pool
        if (address(this).balance > 0) {
            payable(uniswapPool).transfer(address(this).balance);
        }
        
        emit Migrated(uniswapPool, ethReserve, totalSupply);
    }
    
    /**
     * @dev Get contract info
     */
    function getInfo() external view returns (
        uint256 _totalSupply,
        uint256 _ethReserve,
        uint256 _currentPrice,
        uint256 _totalTrades,
        uint256 _totalVolume,
        bool _migrated
    ) {
        return (
            totalSupply,
            ethReserve,
            getPrice(totalSupply),
            totalTrades,
            totalVolume,
            migrated
        );
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
