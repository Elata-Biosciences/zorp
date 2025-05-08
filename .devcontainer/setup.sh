#!/usr/bin/env bash
set -e

# Install system dependencies
sudo apt-get update && sudo apt-get install -y curl libusb-1.0-0-dev

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
/home/node/.foundry/bin/foundryup

# Add Foundry to PATH for current and future sessions
if ! grep -q '/home/node/.foundry/bin' /home/node/.bashrc; then
  echo 'export PATH="/home/node/.foundry/bin:$PATH"' >> /home/node/.bashrc
fi
export PATH="/home/node/.foundry/bin:$PATH"

# Configure git safe directory
git config --global --add safe.directory /workspaces/zorp
git config --global --add safe.directory /workspaces/zorp/zorp-contracts/lib/forge-std
git config --global --add safe.directory /workspaces/zorp/zorp-contracts/lib/openzeppelin-contracts

# Install contract dependencies
cd /workspaces/zorp/zorp-contracts
/home/node/.foundry/bin/forge install

# Build contracts to generate ABIs
/home/node/.foundry/bin/forge build

# Install frontend dependencies
cd /workspaces/zorp/zorp-frontend
npm install

# Fix permissions for frontend build artifacts
sudo chown -R node:node .next node_modules || true

# Return to workspace root
cd /workspaces/zorp

echo "Setup complete!" 