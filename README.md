# ZORP – Zero-Knowledge On-chain Research Protocol

ZORP is a privacy-preserving data collection and reward distribution platform built on [Semaphore](https://semaphore.appliedzkp.org/). It allows participants to submit data (e.g., EEG or survey results) pseudonymously, while enabling administrators to moderate submissions and distribute rewards in ETH or a native token.

## Project Overview

- **Smart Contracts** (`zorp-contracts`): Written in Solidity using Foundry, handle study creation, data submission, moderation, and reward payout.
- **Front-End** (`zorp-frontend`): A Next.js + RainbowKit application that lets users create and manage studies, upload data to IPFS, and interact with the contracts on-chain (e.g., Base Goerli / Base mainnet).

## Repository Structure

```bash
zorp/
├─ README.md
├─ zorp-contracts/
│  ├─ foundry.toml
│  ├─ src/
│  ├─ script/
│  ├─ test/
│  ├─ lib/
│  └─ ...
├─ zorp-frontend/
│  ├─ package.json
│  ├─ app/
│  ├─ components/
│  ├─ ...
└─ .gitignore
```

### `zorp-contracts/` (Foundry Project)

- **Purpose**: Contains all the ZORP smart contracts (e.g., `ZorpFactory.sol`, `ZorpStudy.sol`) and Foundry configuration/testing.
- **Key Files**:
  - `foundry.toml`: Foundry configuration (compiler settings, etc.).
  - `src/`: Your main Solidity source files (contracts).
  - `test/`: Solidity tests using Foundry’s test framework.
  - `script/`: Scripts for deploying or interacting with the contracts (`.s.sol` files).
  - `lib/`: For external libraries like OpenZeppelin.

#### How to Run (Dev)

1. **Install Foundry** (if not already):  
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
2. **Build the project**:  
   ```bash
   cd zorp-contracts
   forge build
   ```
3. **Run tests**:  
   ```bash
   forge test
   ```
4. **Deploying**:  
   - Example: `forge script script/DeployZorp.s.sol --rpc-url <YOUR_RPC> --private-key <YOUR_KEY> --broadcast`

### `zorp-frontend/` (Next.js + RainbowKit)

- **Purpose**: A React-based web application for managing studies, uploading data to IPFS, and interacting with the ZORP contracts.
- **Key Files**:
  - `package.json`: Manages dependencies, including Next.js, wagmi, RainbowKit.
  - `pages/`: Next.js pages like `index.tsx`, `[studyId].tsx` for study detail, etc.
  - `components/`: Reusable UI components.
  - `styles/`: Tailwind CSS files or global styles.

#### How to Run (Dev)

1. **Install Dependencies**:  
   ```bash
   cd zorp-frontend
   npm install
   # or yarn install
   ```
2. **Configure Environment** (e.g., `.env.local`):  
   - You may need variables for **NEXT_PUBLIC_RPC_URL**, **NEXT_PUBLIC_CONTRACT_ADDRESS**, or **IPFS_API_KEY** if using a pinned storage service.
3. **Start the Dev Server**:  
   ```bash
   npm run dev
   # or yarn dev
   ```
4. **Open** [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Contributing

1. **Fork** the repo or clone it locally.
2. **Work** on a feature branch (e.g., `feature/add-contract-tests`).
3. **Submit** a Pull Request for review.

## License

This project is licensed under [GPL-3.0](./LICENSE).

