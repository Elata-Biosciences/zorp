#!/usr/bin/env bash

##
# WARN: not intended for CI/CD or public build/deploy pipelines!!!
##

## Halt and catch fire on errors
set -eET

## Find true directory this script resides in
__SOURCE__="${BASH_SOURCE[0]}"
while [[ -h "${__SOURCE__}" ]]; do
	__SOURCE__="$(find "${__SOURCE__}" -type l -ls | sed -n 's@^.* -> \(.*\)@\1@p')";
done
__DIR__="$(cd -P "$(dirname "${__SOURCE__}")" && pwd)";
__G_DIR__="$(dirname "${__DIR__}")";

## Some variables for Anvil
_test_net_url='127.0.0.1:8545';
_test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
_initialOwner='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

pushd "${__G_DIR__}/zorp-contracts" 1>/dev/null 2>&1;

forge script \
	-vvvvv \
	--offline \
	--broadcast \
	--rpc-url "${_test_net_url}" \
	--private-key "${_test_private_key0}" \
	script/DeployAnvil.s.sol:DeployAnvil;

popd 1>/dev/null 2>&1;

