# MetaChain DeFi & NFT Ecosystem 🌐⚡

Welcome to **MetaChain**, a fully integrated decentralized ecosystem combining token faucet claims, multi-token swaps, liquidity pools, and a premium digital art NFT marketplace powered by native platform tokens on Sepolia.

---

## 🚀 Deployed Contract Addresses

All contracts are deployed and verified on the **Sepolia Testnet** (Chain ID: `11155111`).

| Contract Name | Symbol / Purpose | Contract Address |
| :--- | :--- | :--- |
| **PlatformToken** | `DNFT` (Ecosystem Utility Token) | [`0xE9c471317EDF1108F8EE89C5b5bDf22AE3215b6F`](https://sepolia.etherscan.io/address/0xE9c471317EDF1108F8EE89C5b5bDf22AE3215b6F) |
| **TokenA** | `TKNA` (Test USD Coin) | [`0xE67ADA0705bBE549eDCe788c6c7B194FEeDeAF86`](https://sepolia.etherscan.io/address/0xE67ADA0705bBE549eDCe788c6c7B194FEeDeAF86) |
| **TokenB** | `TKNB` (Test Bitcoin) | [`0xD42346Ee7A7dA8EA0834c3d95432584D773F72e8`](https://sepolia.etherscan.io/address/0xD42346Ee7A7dA8EA0834c3d95432584D773F72e8) |
| **TokenFaucet** | Claims 100 `DNFT` daily | [`0x4A5CD0c24cD7408e4997E179937643C0893eafd1`](https://sepolia.etherscan.io/address/0x4A5CD0c24cD7408e4997E179937643C0893eafd1) |
| **MultiTokenDEX** | Swap & LP for DNFT/TKNA/TKNB | [`0xf35a8BCe60205fe7D478B5A586A548Ecc89F9141`](https://sepolia.etherscan.io/address/0xf35a8BCe60205fe7D478B5A586A548Ecc89F9141) |
| **NFTCollection** | ERC-721 Collection of Virtual Art | [`0xa587754bD4035F83f75F6B53386C2929F56Fb3d9`](https://sepolia.etherscan.io/address/0xa587754bD4035F83f75F6B53386C2929F56Fb3d9) |
| **NFTMarketplace** | Buy NFTs via auto-swapping DEX | [`0xE9487F2ae9B457592331c26E484Bb8CdE69d8e72`](https://sepolia.etherscan.io/address/0xE9487F2ae9B457592331c26E484Bb8CdE69d8e72) |

---

## 🎨 Pinata IPFS Asset Directory

The artwork and JSON metadata files for the 10 listing NFTs are pinned to IPFS via Pinata.

### NFT Metadata CIDs (JSON)

- **NFT #0: Neon Cyber Glitch** -> `ipfs://bafkreibgta3eax5qcx2xs3gost2uc4ma6spe425z4yfbuvmid2da3widlm`
- **NFT #1: Nebula Voyager** -> `ipfs://bafkreicusi5ulogikijb5sr66qkahcna7te32xir7dvbf6yofn3hky3j5i`
- **NFT #2: Quantum Portal** -> `ipfs://bafkreie65cxvaordjs43wo7d7qb6hbbzhxdt6dcbwccpdy26pffieehnom`
- **NFT #3: Synthwave Sunset** -> `ipfs://bafkreifqtdnqkmo7bi5zm7u62b4iaxahh5tigot7wvin3stoqwczgb6w6a`
- **NFT #4: Ether Shard** -> `ipfs://bafkreihm7d3dcqpe5fqhfur7kcfjhbzxjtb5c4g4aexyragehgfwoz7le4`
- **NFT #5: Pixelated Potion** -> `ipfs://bafkreicyotmee5zxqbwyhi4yh7roizzfrpnxt2udhjt2fptrktk3ydf7pu`
- **NFT #6: Holographic Skull** -> `ipfs://bafkreielxcnuftrdsbly2yssptqpxlpwuc3ziimezkbz5dg5t3mqczuncy`
- **NFT #7: Golden Bitcoin** -> `ipfs://bafkreigd6oll4zxytj4dgy55kwbmqy6a5lxsymowwheit2khk4auxh5jsq`
- **NFT #8: Crypto Kitty V2** -> `ipfs://bafkreia2mc7dvjkfoaca2gwhdrllwj5fomjjf7ryrl3fbam4csgpqg7dv4`
- **NFT #9: Antigravity Core** -> `ipfs://bafkreiea2yrstdglap7axj7qtw4ahywlwoyuonzeqdf6siqeshfqtja6hi`

---

## 🎯 Key Features Implemented

### 1. Token Faucet
- Enforces a secure **24-hour claim cooldown** mapping user addresses.
- Displays live countdown timer on frontend.
- Tracks and displays total historical claims per user.

### 2. Constant-Product Multi-Token DEX
- Supported pools:
  1. Platform Token `DNFT` ↔ Token A `TKNA`
  2. Platform Token `DNFT` ↔ Token B `TKNB`
  3. Token A `TKNA` ↔ Token B `TKNB`
- Real-time reserves queries & pool stats.
- Dynamic input/output estimation via constant-product formula $x \times y = k$.
- Add/remove liquidity flows with minting/burning of LP shares.

### 3. NFT Marketplace
- Auto-swapping mechanism: Users can purchase listed NFTs using **any** of the supported tokens (`DNFT`, `TKNA`, or `TKNB`).
- If buying with `TKNA`/`TKNB`, the marketplace calculates the equivalent price in the payment token via the DEX reserves, pulls the payment token, performs an automated swap for `DNFT` inside the DEX, and transfers ownership of the NFT.
- Real-time conversion price estimates displayed in frontend.
- Supports secondary resales with a 2.5% creator royalty.

### 4. Premium Responsive Frontend
- Built with **React, TypeScript, Vite, and Vanilla CSS** (no Tailwind).
- Fully responsive tech-noir dark mode with cyberpunk glows, glassmorphism cards, and micro-interactions.
- Seamless network switching to Sepolia.
- Type-safe, high-performance multicalls for scanning NFT collection ownerships in the portfolio.

---

## 🛠️ Local Development & Installation

### 1. Clone & Setup Workspace
```bash
git clone <your-repo-uri>
cd defi-nft-ecosystem
```

### 2. Setup Blockchain (Hardhat)
```bash
cd blockchain
npm install
```
Configure your `.env` in `blockchain/`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=your-deployer-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```
Run tests:
```bash
npx hardhat test
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Ensure MetaMask is connected to the **Sepolia Testnet**.

---

## 🛡️ License
Project submitted under standard developer terms. MetaChain © 2026.
