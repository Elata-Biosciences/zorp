# Deployment Guide for Zorp Smart Contracts

This guide will help you deploy the Zorp smart contracts to a testnet (like Base Goerli) and update the frontend configuration to interact with the deployed contracts.

## Prerequisites

1. Make sure you have Foundry installed:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Generate a GPG/PGP key pair for encryption if you don't have one:
   ```bash
   gpg --full-generate-key
   ```

3. Fund your wallet on the target testnet (e.g., Base Goerli)
   - Get testnet ETH from a faucet like https://faucet.quicknode.com/base/goerli

4. Export your private key from your wallet provider (MetaMask, etc.)

## Step 1: Deploy the ZorpFactory Contract

1. Navigate to the `zorp-contracts` directory:
   ```bash
   cd zorp-contracts
   ```

2. Build the contracts:
   ```bash
   forge build
   ```

3. Deploy the contracts to Base Goerli using the deployment script:
   ```bash
   export RPC_URL="https://goerli.base.org"
   export PRIVATE_KEY="your-private-key-here"
   export FACTORY_OWNER="your-wallet-address-here"
   
   # Edit the DeployBaseGoerli.s.sol file to set your wallet address as ZorpFactory_Owner
   
   forge script -vvvvv \
     --broadcast \
     --rpc-url "$RPC_URL" \
     --private-key "$PRIVATE_KEY" \
     script/DeployBaseGoerli.s.sol:DeployBaseGoerli
   ```

4. Note the deployed ZorpFactory contract address from the console output.

## Step 2: Update Frontend Configuration

1. Navigate to the frontend configuration file:
   ```bash
   cd ../zorp-frontend/src/lib/constants
   ```

2. Update the `wagmiConfig.ts` file with your deployed contract addresses:
   - Add Base Goerli chain configuration if not present
   - Update the contract addresses in the configuration

   Example modifications to `wagmiConfig.ts`:
   ```typescript
   export const baseGoerli = /*#__PURE__*/ defineChain({
     ...chainConfig,
     id: 84531,
     name: 'Base Goerli',
     nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
     rpcUrls: {
       default: {
         http: ['https://goerli.base.org'],
       },
     },
     blockExplorers: {
       default: {
         name: 'BaseScan',
         url: 'https://goerli.basescan.org',
         apiUrl: 'https://api-goerli.basescan.org/api',
       },
     },
     contracts: {
       IZorpFactory: {
         84531: {
           address: 'YOUR_DEPLOYED_FACTORY_ADDRESS',
           abi: IZorpFactory.abi,
         },
       },
     },
   });
   
   // Add the baseGoerli chain to the chains array
   export const wagmiConfig = getDefaultConfig({
     appName: 'Zorp dApp',
     projectId: projectId,
     wallets: wallets,
     chains: [
       mainnet,
       arbitrum,
       base,
       baseGoerli, // Add Base Goerli chain
       anvil,
       ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
     ],
     transports,
     ssr: true,
   });
   ```

## Step 3: Create a Study

After deploying the ZorpFactory contract and updating the frontend configuration, you can create a study using either the web interface or CLI:

### Using Web Interface (Recommended)

1. Start the frontend development server:
   ```bash
   cd zorp-frontend
   npm install
   npm run dev
   ```

2. Navigate to `/zorp/factory/create-study` in your browser
3. Follow the on-screen instructions to:
   - Upload your public GPG/PGP key to Irys
   - Create a new study via the ZorpFactory contract
   - Start the study

### Using CLI

1. Generate an IPFS CID from your public GPG/PGP key:
   ```bash
   cd zorp-frontend
   node --experimental-transform-types
   ```

   Then in the Node REPL:
   ```javascript
   var { cidFromFile } = await import('./src/lib/utils/ipfs.ts');
   var fs = await import('fs');
   var file = fs.readFileSync('path-to-your-public-gpg-key');
   if (!('arrayBuffer' in file)) { file.arrayBuffer = async () => new ArrayBuffer(file); }
   console.log(await cidFromFile(file));
   ```

2. Upload your public GPG/PGP key to Irys:
   ```bash
   irys upload "path-to-public-gpg-key" \
     -t base \
     -w "your-private-key" \
     --tags 'IPFS-CID' "cid-from-previous-step" \
            'Content-Type' 'application/pgp-encrypted';
   ```

3. Create a new study using the deployed ZorpFactory contract:
   ```bash
   cast send "DEPLOYED_FACTORY_ADDRESS" \
     --rpc-url "https://goerli.base.org" \
     --private-key "your-private-key" \
     --value "amount-to-fund-study-with" \
     'createStudy(address,string)(address)' \
       "your-wallet-address" \
       "cid-from-previous-step";
   ```

4. Start your new ZorpStudy contract instance:
   ```bash
   cast send "ZORPSTUDY_ADDRESS" \
      --rpc-url "https://goerli.base.org" \
      --private-key "your-private-key" \
      'startStudy()';
   ```

## Next Steps

- After creating a study, share the ZorpStudy contract address with participants
- Monitor submissions through the web interface or CLI
- End the study and distribute rewards when ready

For more detailed information, refer to the README.md file in the root directory of the project. 