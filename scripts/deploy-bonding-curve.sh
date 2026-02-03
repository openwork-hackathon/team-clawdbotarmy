#!/bin/bash
# Deploy Minimal Bonding Curve to Base using cast
# Most economical: ~0.001 ETH or less

set -e

RPC_URL="${RPC_URL:-https://base-mainnet.public.blastapi.io}"
PRIVATE_KEY="${PRIVATE_KEY:-}"

TOKEN_ADDRESS="0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07"

echo "=== Deploying Minimal Bonding Curve to Base ==="
echo "RPC: ${RPC_URL:0:50}..."
echo "Token: $TOKEN_ADDRESS"

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: Set PRIVATE_KEY env variable"
    echo "PRIVATE_KEY=0x... $0"
    exit 1
fi

# Get deployment bytecode (MinimalBondingCurve with token address)
# This is a simplified deployment - the contract is already compiled
# For production, use: forge build && forge create

echo ""
echo "Deploying via Clanker is cheaper (~0.0001 ETH):"
echo "1. Go to https://www.clanker.world/deploy"
echo "2. Fill in token details"
echo "3. Deploy - creates token + Uniswap V4 pool automatically"
echo ""
echo "Or deploy via forge (requires compilation):"
echo "  forge build && forge create --rpc-url \$RPC_URL --private-key \$PRIVATE_KEY contracts/MinimalBondingCurve.sol:MinimalBondingCurve --constructor-args \$TOKEN_ADDRESS"
