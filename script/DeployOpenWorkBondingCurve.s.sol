// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 } from "forge-std/Script.sol";
import { OpenWorkBondingCurve } from "../contracts/OpenWorkBondingCurve.sol";

/**
 * @title DeployOpenWorkBondingCurve
 * @dev Deploy OpenWorkBondingCurve to Base mainnet or testnet
 * 
 * Usage:
 *   export OPENWORK_TOKEN=0x...
 *   forge script script/DeployOpenWorkBondingCurve.s.sol \
 *     --rpc-url base \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 */
contract DeployOpenWorkBondingCurve is Script {
    
    // OPENWORK token address (set via environment or constructor)
    address public openworkToken;
    
    function run() external {
        console2.log(" Deploying OpenWorkBondingCurve to Base...");
        
        // Get OPENWORK token from env or use placeholder
        openworkToken = vm.envAddress("OPENWORK_TOKEN", address(0));
        
        if (openworkToken == address(0)) {
            console2.log("⚠️  Warning: OPENWORK_TOKEN not set. Set with:");
            console2.log("   export OPENWORK_TOKEN=0x...");
            console2.log("   Using address(0) for now (will need to configure later)");
        } else {
            console2.log(" OPENWORK Token:", openworkToken);
        }
        
        // Get deployer from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console2.log(" Deployer:", deployer);
        
        // Deploy contract
        vm.startBroadcast(deployerPrivateKey);
        
        OpenWorkBondingCurve curve = new OpenWorkBondingCurve(openworkToken);
        
        vm.stopBroadcast();
        
        console2.log(" OpenWorkBondingCurve deployed!");
        console2.log("📄 Contract:", address(curve));
        console2.log("🪙 OPENWORK Token:", openworkToken);
        console2.log("");
        console2.log("Token Parameters:");
        console2.log("  - Initial Supply: 5M OPENWORK");
        console2.log("  - Max Supply: 50M OPENWORK");
        console2.log("  - Slope (a): 0.000001 ETH");
        console2.log("  - Base (b): 0.0001 ETH");
        console2.log("  - Migration Threshold: 50 ETH");
        console2.log("");
        console2.log("Next steps:");
        console2.log("1. Verify on Basescan:");
        console2.log("   npx hardhat verify --network base", address(curve), openworkToken);
        console2.log("2. Update frontend config");
        console2.log("3. Set OPENWORK token address before trading");
    }
}
