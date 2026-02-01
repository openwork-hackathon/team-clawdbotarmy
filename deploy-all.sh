#!/bin/bash
# Deploy all bonding curve contracts to Base

set -e

echo "🦞 Deploying ClawdbotArmy Bonding Curves to Base"
echo "================================================"

# Check for private key
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set"
    echo ""
    echo "Usage:"
    echo "  export PRIVATE_KEY=your_base_wallet_private_key"
    echo "  bash deploy-all.sh"
    echo ""
    echo "Get private key from MetaMask:"
    echo "  Account Details → Show Private Key"
    exit 1
fi

echo "📝 Deployer wallet configured"
echo ""

# Check balance (optional)
BALANCE=$(cast balance --rpc-url base $(cast address $PRIVATE_KEY) 2>/dev/null || echo "0")
if [ "$BALANCE" != "0" ]; then
    echo "💰 Balance: $(echo "$BALANCE / 1e18" | bc) ETH"
fi
echo ""

echo "🚀 Deploying AryaBondingCurve..."
forge script script/DeployAryaBondingCurve.s.sol \
    --rpc-url base \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify

echo ""
echo "🚀 Deploying OpenWorkBondingCurve..."
forge script script/DeployOpenWorkBondingCurve.s.sol \
    --rpc-url base \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify

echo ""
echo "🚀 Deploying MultiTokenBondingCurve..."
forge script script/DeployMultiTokenBondingCurve.s.sol \
    --rpc-url base \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify

echo ""
echo "✅ All contracts deployed!"
echo ""
echo "Next steps:"
echo "1. Update frontend config with contract addresses"
echo "2. Verify contracts on Basescan"
echo "3. Add initial liquidity"
