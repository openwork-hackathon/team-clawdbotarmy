# Web3.js Integration Snippets

## Connect to Contract

```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const CONTRACT_ADDRESS = "0x...";

const ABI = [
  "function buy(uint256 amount) payable",
  "function sell(uint256 amount, uint256 minOut)",
  "function getPrice(uint256 amount) view returns (uint256)",
  "function getReserve() view returns (uint256)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
```

## Buy Tokens

```javascript
async function buyTokens(amountInETH) {
  const tx = await contract.buy(amountInETH, {
    value: ethers.parseEther(amountInETH.toString())
  });
  await tx.wait();
}
```

## Sell Tokens

```javascript
async function sellTokens(amount) {
  const minOut = await contract.getPrice(amount);
  const tx = await contract.sell(amount, minOut);
  await tx.wait();
}
```

## Get Current Price

```javascript
async function getCurrentPrice() {
  const price = await contract.getPrice(ethers.parseEther("1"));
  return ethers.formatEther(price);
}
```
