// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 } from "forge-std/Script.sol";
import { MultiTokenBondingCurve } from "../contracts/MultiTokenBondingCurve.sol";

/**
 * @title DeployMultiTokenBondingCurve
 * @dev Deploy unified bonding curve for ARYA + OPENWORK
 * 
 * Usage:
 *   forge script script/DeployMultiTokenBondingCurve.s.sol \
 *     --rpc-url base \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 */
contract DeployMultiTokenBondingCurve is Script {
    
    address constant ARYA_TOKEN = 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07;
    address constant OPENWORK_TOKEN = 0x0000000000000000000000000000000000000000; // Set later
    
    function run() external {
        console2.log("🚀 Deploying MultiTokenBondingCurve to Base...");
        console2.log("");
        console2.log("This contract supports:");
        console2.log("  - ARYA:   0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07");
        console2.log("  - OPENWORK: 0x... (placeholder)");
        
        // Get deployer from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console2.log("📝 Deployer:", deployer);
        
        // Deploy contract
        vm.startBroadcast(deployerPrivateKey);
        
        MultiTokenBondingCurve curve = new MultiTokenBondingCurve();
        
        vm.stopBroadcast();
        
        console2.log("");
        console2.log("✅ MultiTokenBondingCurve deployed!");
        console2.log("📄 Contract:", address(curve));
        console2.log("");
        console2.log("Features:");
        console2.log("  - Single contract for all tokens");
        console2.log("  - Configurable token parameters");
        console2.log("  - Pre-configured ARYA and OPENWORK");
        console2.log("  - Migration to Uniswap V4");
        console2.log("");
        console2.log("API:");
        console2.log("  - buy(token, minTokens)");
        console2.log("  - sell(token, tokenAmount, minEth)");
        console2.log("  - getInfo(token)");
        console2.log("  - getPrice(token)");
        console2.log("");
        console2.log("Next steps:");
        console2.log("1. Verify on Basescan:");
        console2.log("   npx hardhat verify --network base", address(curve));
        console2.log("2. Configure OPENWORK token: addTokenConfig()");
        console2.log("3. Update frontend config");
    }
}
