// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 } from "forge-std/Script.sol";
import { AryaBondingCurve } from "../contracts/AryaBondingCurve.sol";

/**
 * @title DeployAryaBondingCurve
 * @dev Deploy AryaBondingCurve to Base mainnet or testnet
 * 
 * Usage:
 *   forge script script/DeployAryaBondingCurve.s.sol \
 *     --rpc-url base \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 */
contract DeployAryaBondingCurve is Script {
    
    // ARYA token on Base mainnet
    address constant ARYA_TOKEN = 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07;
    
    function run() external {
        console2.log(" Deploying AryaBondingCurve to Base...");
        
        // Get deployer from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console2.log(" Deployer:", deployer);
        
        // Deploy contract
        vm.startBroadcast(deployerPrivateKey);
        
        AryaBondingCurve curve = new AryaBondingCurve(ARYA_TOKEN);
        
        vm.stopBroadcast();
        
        console2.log(" AryaBondingCurve deployed!");
        console2.log(unicode"[Contract] Contract:", address(curve));
        console2.log(unicode"[Token] ARYA Token:", ARYA_TOKEN);
        console2.log("");
        console2.log("Next steps:");
        console2.log("1. Verify on Basescan:");
        console2.log("   npx hardhat verify --network base", address(curve), ARYA_TOKEN);
        console2.log("2. Update frontend config");
    }
}
