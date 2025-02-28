#!/usr/bin/env bash

##
# WARN: not intended for CI/CD or public build/deploy pipelines!!!
#       because when __VERBOSE__ is truthy private keys are exposed
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

## Read environment variable(s)
__VERBOSE__="${VERBOSE:-0}";
_encryptionKey="${1:?Undefined GPG public encryption key}";

## Some variables for Anvil
_test_net_url='127.0.0.1:8545';
_test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
_initialOwner='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

## 
# Publish `ZorpFactory` to Anvil and return contract address
ZorpFactory_constructor() {
	local -a _args=(
		create 
		--broadcast
		--rpc-url "${_test_net_url}"
		--private-key "${_test_private_key0}"
		src/ZorpFactory.sol:ZorpFactory
		--constructor-args "${_initialOwner}" 
	);

	pushd "${__G_DIR__}/zorp-contracts" 1>/dev/null 2>&1;

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_publish command --->\nforge %s\n<--- ZorpFactory_publish command\n' "${_args[*]}";
	fi

	local _result;
	_result="$( forge "${_args[@]}" )";
	popd 1>/dev/null 2>&1;

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_publish result --->\n%s\n<--- ZorpFactory_publish result\n' "${_result:?Undefined result}";
	fi

	awk '{
		if ($0 ~ "Deployed to:") {
			print $3;
			exit 0;
		}
	}' <<<"${_result}";
}

ZorpFactory_owner() {
	local _zorp_factory_address="${1:?Undefined Zorp Factory address}";

	## TODO: maybe allow for parameters to set these
	local _createStudy_address="${_initialOwner}";
	local _createStudy_encryptionKey="${_encryptionKey}";

	local _args=(
		call "${_zorp_factory_address}"
		--rpc-url "${_test_net_url}"
		'owner()(address)'
	);

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_createStudy command --->\ncast %s\n<--- ZorpFactory_createStudy command\n' "${_args[*]}";
	fi

	cast "${_args[@]}";
}
##
#
ZorpFactory_createStudy() {
	local _zorp_factory_address="${1:?Undefined Zorp Factory address}";

	## TODO: maybe allow for parameters to set these
	local _createStudy_owner="${_initialOwner}";
	local _createStudy_encryptionKey="${_encryptionKey}";

	local _args=(
		call "${_zorp_factory_address}"
		--rpc-url "${_test_net_url}"
		--private-key "${_test_private_key0}"
		--value "1ether"
		'createStudy(address,string)(address)'
			"${_createStudy_owner}"
			"${_createStudy_encryptionKey}"
	);

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_createStudy command --->\ncast %s\n<--- ZorpFactory_createStudy command\n' "${_args[*]}";
	fi

	cast "${_args[@]}";
}

## Do the thangs
_zorp_factory_address="$( ZorpFactory_constructor )";
printf >&2 '_zorp_factory_address -> %s\n' "${_zorp_factory_address}"

_zorp_study_address="$( ZorpFactory_createStudy "${_zorp_factory_address}" )";
printf >&2 '_zorp_study_address -> %s\n' "${_zorp_study_address}"
