// Minimal Bonding Curve Contract for Base
// Deploy with: cast publish --rpc-url base < deployment.tx

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MinimalBondingCurve {
    address public owner;
    address public token;
    uint256 public totalSupply;
    uint256 public reserve;
    uint256 public constant A = 0.00000000001;  // slope
    uint256 public constant B = 0.00001;        // base price (ETH)
    uint256 public constant MAX_SUPPLY = 10000000;
    
    event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut);
    event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut);
    
    constructor(address _token) {
        owner = msg.sender;
        token = _token;
    }
    
    function getPrice(uint256 supply) public view returns (uint256) {
        return A * supply + B;
    }
    
    function buy(uint256 minTokens) external payable {
        require(msg.value > 0, "Need ETH");
        uint256 price = getPrice(totalSupply);
        uint256 tokensOut = msg.value / price;
        require(totalSupply + tokensOut <= MAX_SUPPLY, "Max supply");
        require(tokensOut >= minTokens, "Slippage");
        
        totalSupply += tokensOut;
        reserve += msg.value;
        
        (bool success,) = msg.sender.call{value: 0}(""); // Placeholder for token transfer
        emit Buy(msg.sender, msg.value, tokensOut);
    }
    
    function sell(uint256 tokensIn, uint256 minEth) external {
        require(tokensIn > 0, "Need tokens");
        require(totalSupply >= tokensIn, "Insufficient supply");
        
        uint256 startPrice = getPrice(totalSupply);
        uint256 endPrice = getPrice(totalSupply - tokensIn);
        uint256 avgPrice = (startPrice + endPrice) / 2;
        uint256 ethOut = tokensIn * avgPrice;
        
        require(ethOut <= reserve, "Insufficient reserve");
        require(ethOut >= minEth, "Slippage");
        
        totalSupply -= tokensIn;
        reserve -= ethOut;
        
        payable(msg.sender).transfer(ethOut);
        emit Sell(msg.sender, tokensIn, ethOut);
    }
    
    function withdrawReserves() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
}
