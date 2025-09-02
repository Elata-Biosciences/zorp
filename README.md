<div align="center">

# ZORP Protocol

ZORP Protocol is a permissionless and open research data and reward distribution platform. ZORP enables a distributed set of participants to submit data (particularly EEG signatures or survey results) to managers, who moderate submissions and distribute token rewards. ZORP Protocol enables coordinated research efforts to be executed at massive scale: real human participants can now interface directly with experiment coordinators without needing approval from third-party intermediaries such as Institutional Review Boards or the various Subcommittees that often prolong the R&D process.

![elata](https://raw.githubusercontent.com/Elata-Biosciences/branding-assets/a144f80f1d9f470e04bd65c504491cccd4798347/miscellaneous/ZORP%20-%20GitHub%20img%20(1).svg)

![Discord](https://img.shields.io/discord/:1236379318071070731)
![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/Elata_Bio)
![license](https://img.shields.io/badge/License-GPL%20v3-blue.svg)
![GitHub Repo stars](https://img.shields.io/github/stars/Elata-Biosciences/zorp)

</div>

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
  - `test/`: Solidity tests using Foundry's test framework.
  - `script/`: Scripts for deploying or interacting with the contracts (`.s.sol` files).
  - `lib/`: For external libraries like OpenZeppelin.

#### How to Run (Dev)

1. **Install Foundry** (if not already):  
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
   > :warning: Be sure to double-check official installation
   > [documentation](https://book.getfoundry.sh/getting-started/installation)
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
   - Syntax: `forge script script/DeployZorp.s.sol --rpc-url <YOUR_RPC> --private-key <YOUR_KEY> --broadcast`
   - Example for Anvil:
      ```bash
      _test_net_url='127.0.0.1:8545';
      _test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

      pushd "zorp-contracts";

      forge script \
        --offline \
        --broadcast \
        --rpc-url "${_test_net_url}" \
        --private-key "${_test_private_key0}" \
        script/DeployAnvilZorp.s.sol:DeployAnvil;
      ```

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

## How to Run in Dev Container (Recommended)

ZORP provides a full-featured [VS Code Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) setup for seamless onboarding and reproducible development. This is the easiest way to get started, as it automatically installs all dependencies for both the smart contracts and frontend.

### Prerequisites
- [Docker](https://www.docker.com/get-started) installed and running
- [Visual Studio Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Quick Start
1. **Open the project in VS Code**
   - Use `File > Open Folder...` and select the root `zorp/` directory.
2. **Reopen in Container**
   - When prompted, or via the Command Palette (`Ctrl+Shift+P` → "Dev Containers: Reopen in Container"), VS Code will build and start the dev container using `.devcontainer/devcontainer.json` and `docker-compose.yml`.
3. **Automatic Setup**
   - On first launch, the container will run `.devcontainer/setup.sh` to:
     - Install system dependencies (curl, libusb)
     - Install Foundry and add it to the PATH
     - Install contract dependencies and build contracts
     - Install frontend dependencies
   - All ports (3000 for frontend, 8545 for local blockchain) are forwarded automatically.
4. **Start Services**
   - The dev container setup provides three main services:
     - `dev-base`: Main development shell (where VS Code attaches)
     - `anvil`: Local blockchain node (auto-starts)
     - `frontend`: Next.js dev server (auto-starts)
   - If not started automatically, you can run the following in the VS Code terminal:
     - To start the local blockchain (Anvil):
       ```bash
       docker-compose -f .devcontainer/docker-compose.yml up anvil
       ```
     - To start the frontend dev server:
       ```bash
       docker-compose -f .devcontainer/docker-compose.yml up frontend
       ```
5. **Access the App**
   - Open [http://localhost:3000](http://localhost:3000) for the frontend.
   - The local blockchain is available at `http://localhost:8545`.


## Usage

### Usage -- Study Creators

1. Prerequisites:
  - Create a GPG/PGP key pair for encryption
  - Fund your Base wallet and Irys account
2. Create a study:
  - Recommend Web-UI end-points;
    1. `/zorp/factory/create-study` provided by `zorp-frontend` is recommended as this will; upload your **public** GPG/PGP to Irys, call `ZorpFactory.createStudy` with the necessary inputs, and return the address for your new `ZorpStudy` instance
    2. `/zorp/study/start-study` provided by `zorp-frontend` is recommended to use when you're ready to start your study
    3. `/zorp/study/flag-invalid-submission` may be used to flag individual account submissions as invalid, this will delete CID pointer from the contract storage and mark the account as unable to receive a payout after the study is ended
    4. `/zorp/study/end-study` provided by `zorp-frontedn` is recommended to use when you're ready to end your study and allow participants to withdraw their payout
  - CLI is more involved, and has more opportunity for mistakes;
    1. Generate an IPFS CID from your **public** GPG/PGP key
      - Start a Node REPL
          ```bash
          pushd zorp-frontend
          node --experimental-transform-types
          ```
      - Generate an IPFS CID from **public** GPG/PGP key
          ```javascript
          var { cidFromFile } = await import('./src/lib/utils/ipfs.ts');
          var fs = await import('fs');
          var file = fs.readFileSync('<path-to-public-gpg-key>');
          if (!('arrayBuffer' in file)) { file.arrayBuffer = async () => new ArrayBuffer(file); }
          console.log(await cidFromFile(file));
          ```
      - Restore previous current working directory
          ```bash
          popd zorp-frontend
          ```
    2. Upload your **public** GPG/PGP key to [Irys](https://docs.irys.xyz/build/d/storage-cli/commands/upload)
       ```bash
       irys upload "<pubic-gpg-key>" \
         -t base \
         -w "<private-wallet-key>" \
         --tags 'IPFS-CID' "<cid-from-previous-step>" \
                'Content-Type' 'application/pgp-encrypted';
       ```
    3. Fund and create a new study, search output for `"Deployed to:"` address for your new `ZorpStudy` contract instance
       ```bash
       cast send "<ZorpFactory-address>" \
         --rpc-url "<url>" \
         --private-key "<private-wallet-key>" \
         --value "<amount-to-fund-study-with>" \
         'createStudy(address,string)(address)' \
           "<public-wallet-key>" \
           "<cid-from-previous-step>";
       ```
    4. Start your new `ZorpStudy` contract instance
       ```bash
       cast send "<ZorpStudy-address>" \
          --rpc-url "<rpc-url>" \
          --private-key "<private-wallet-key>" \
          'startStudy()';
       ```
    5. End your `ZorpStudy` and allow participants to claim payout
       ```bash
       cast send "<ZorpStudy-address>" \
          --rpc-url "<url>" \
          --private-key "<private-wallet-key>" \
          'endStudy()';
       ```

> **Notes**
>
> In above CLI examples there are many "fill in your own values" (`<word>`) opportunities for mistakes, the following will attempt to help explain, but if unsure please either use the Web-UI or search GitHub [Issues](https://github.com/Elata-Biosciences/zorp/issues?q=is%3Aissue) or ask on [Discord](https://discord.com/invite/UxSQnZnPus);
>
> - `<pubic-gpg-key>` should be the file-path to the **public** GPG/PGP key study participants will use to encrypt data prior to uploading to Irys, and submitting the CID to your instance of `ZorpStudy.submitData(string)`
> - `<rpc-url>` should be the RPC URL of the chain that `ZorpFactory` is deployed on that you wish to use, for local testing this may be `127.0.0.1:8545`
> - `<cid-from-previous-step>` should be what `console.log(await cidFromFile(file))` output, and eventually will be saved to your `ZorpStudy.encryption_key` instance for participants to use when submitting encrypted data
> - `<private-wallet-key>` should be the crypto-coin wallet's private key used for publishing GPG/PGP **public** key and creating a new `ZorpStudy` instance
> - `<ZorpFactory-address>` should be the smart contract address for the `ZorpFactory` (**not `ZorpStudy`**) accessible via same network/chain that `<rpc-url>` can reach
> - `<amount-to-fund-study-with>` is the **total** amount that will be split evenly among all participants after `ZorpStudy.endStudy()` is executed, please be sure to estimate a fair value to encourage continued involvement from high-quality data submitters!
> - `<ZorpStudy-address>` is returned by `ZorpFactory.createStudy(...)` and is the address you must use for administrating your study

### Usage -- Study Data Submission

1. Prerequisites:
  - Create a GPG/PGP key pair for encryption
  - Fund your Base wallet and Irys account
2. Discover a `ZorpStudy` instance
   > TBD
3. Submit data to a `ZorpStudy` instance
  - Recommend Web-UI end-points;
    1. `/zorp/study/submit-data` is recommended as it will download the public GPG/PGP key for a given `ZorpStudy` instance, request your **public** GPG/PGP key, locally encrypt your data submission with both GPG/PGP public keys as recipients, upload encrypted data to Irys, and then call `ZorpStudy.submitData(string)` with necessary information
    2. `/zorp/study/participant-status` check your on-chain status of a participant account;
      - `0` ⇔ `NA` no data has been submitted
      - `1` ⇔ `SUBMITTED` data has been submitted
      - `2` ⇔ `PAID` payment has been collected
      - `3` ⇔ `INVALID` study moderator marked submission as invalid
    3. `/zorp/study/study-status` check on-chain status of study;
      - `0` ⇔ `NA` study has not been activated
      - `1` ⇔ `ACTIVE` study is ready for data submissions
      - `2` ⇔ `FINISHED` study is no longer accepting new data and ready to pay participants
    4. `/zorp/study/claim-reward` provided an account has the status of `SUBMITTED` **and** the study has the status of `FINISHED`, this end-point maybe used to request payment for data submitted

## Tips

The `zorp-contracts/src/IZorpStudy.sol` file contains interface contract code that, for study creators, maybe be useful for data collection and moderation as well as, for participants, discovery of new studies.  Check the doc-comments for example usage for both React-ish web-apps and CLI scripting.

### Tips -- Study Creators

- `IZorpStudy_Functions.paginateSubmittedData` → Return a possibly sparse array of CID strings pointing to submitted data

### Usage -- Study Data Submission

- `IZorpStudy_Functions.paginateSubmittedData` → Intended for off-chain requests for bulk lookup of `ZorpStudy` contract addresses an instance of `ZorpFactory` tracks

## Contributing

1. **Fork** the repo or clone it locally.
2. **Work** on a feature branch (e.g., `feature/add-contract-tests`).
3. **Submit** a Pull Request for review.

## License

This project is licensed under [GPL-3.0](./LICENSE).

