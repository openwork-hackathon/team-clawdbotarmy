// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 } from "forge-std/Script.sol";
import { AryaOpenWorkStaking } from "../contracts/AryaOpenWorkStaking.sol";

/**
 * @title DeployStakingContract
 * @dev Deploy AryaOpenWorkStaking to Base mainnet
 * 
 * Prerequisites:
 * - ARYA token must be deployed at 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07
 * - OPENWORK token address must be provided
 * - Reward token address must be provided
 */
contract DeployStakingContract is Script {
    
    // Token addresses on Base
    address constant ARYA_TOKEN = 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07;
    address constant OPENWORK_TOKEN = 0x0000000000000000000000000000000000000000; // Set via env or args
    address constant REWARD_TOKEN = 0x0000000000000000000000000000000000000000; // Usually ARYA or separate
    
    function run() external {
        console2.log(" Deploying AryaOpenWorkStaking to Base...");
        
        // Get deployer from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console2.log(" Deployer:", deployer);
        
        // Get token addresses from environment or use defaults
        address openworkToken;
        address rewardToken;
        try vm.envAddress("OPENWORK_TOKEN") returns (address t) { openworkToken = t; } catch { openworkToken = OPENWORK_TOKEN; }
        try vm.envAddress("REWARD_TOKEN") returns (address t) { rewardToken = t; } catch { rewardToken = ARYA_TOKEN; }
        
        console2.log(unicode"[Token] ARYA Token:", ARYA_TOKEN);
        console2.log(unicode"[Token] OPENWORK Token:", openworkToken);
        console2.log(unicode"[Token] Reward Token:", rewardToken);
        
        // Check balance
        uint256 balance = address(deployer).balance;
        console2.log(" Balance:", balance, "wei");
        
        if (balance < 0.01 ether) {
            console2.log(unicode"[Warning]  Warning: Low balance! Need at least 0.01 ETH for deployment");
        }
        
        // Deploy contract
        vm.startBroadcast(deployerPrivateKey);
        
        AryaOpenWorkStaking staking = new AryaOpenWorkStaking(
            ARYA_TOKEN,
            openworkToken,
            rewardToken
        );
        
        vm.stopBroadcast();
        
        console2.log("");
        console2.log(" AryaOpenWorkStaking deployed!");
        console2.log(unicode"[Contract] Contract:", address(staking));
        console2.log("");
        console2.log("Next steps:");
        console2.log("1. Verify on Basescan:");
        console2.log("   npx hardhat verify --network base <CONTRACT> <ARYA> <OPENWORK> <REWARD>");
        console2.log("2. Set reward rates:");
        console2.log("  staking.setPoolRewardRate(0, rewardRate) // ARYA pool");
        console2.log("  staking.setPoolRewardRate(1, rewardRate) // OPENWORK pool");
        console2.log("3. Fund reward token contract with rewards");
        console2.log("");
        console2.log("Contract ready for staking!");
    }
}
