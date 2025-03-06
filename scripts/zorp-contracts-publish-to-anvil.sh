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

_study_initialOwners=(
	'0xd6c12888363B422e72647FB95c97fE007C8a7870'
	'0x612952ab356E692723100b9e91d7cCA209bB4D69'
	'0x3A5b8058b73d6F93b71A46a697Ea35f165bc72A8'
	'0xd50dAfCdB28687B78182566118A53B45e54298e7'
	'0xA6606c82e02337Bd952de5db38104569134B95bd'
	'0x0e9A6f6aBb4a46767515F07d15229755Ac16BFbf'
	'0x1ebE2DC576b1320f8a20a6f4D50Aa9FA183436b2'
	'0x021542581584b215947efaED00778F79b2e8Fb6D'
	'0xF4eF5E0f51dA631Ea5fCc7AB2Cb1F98503f571C3'
)

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

	local _args=(
		call "${_zorp_factory_address}"
		--rpc-url "${_test_net_url}"
		'owner()(address)'
	);

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_owner command --->\ncast %s\n<--- ZorpFactory_owner command\n' "${_args[*]}";
	fi

	cast "${_args[@]}";
}

ZorpFactory_paginateStudies() {
	local _zorp_factory_address="${1:?Undefined Zorp Factory address}";

	local _args=(
		call "${_zorp_factory_address}"
		--rpc-url "${_test_net_url}"
		'paginateStudies(uint256,uint256)(address[])'
			"1"
			"${#_study_initialOwners[@]}"
	);

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_paginateStudies command --->\ncast %s\n<--- ZorpFactory_paginateStudies command\n' "${_args[*]}";
	fi

	cast "${_args[@]}";
}

##
#
ZorpFactory_createStudy() {
	local _zorp_factory_address="${1:?Undefined Zorp Factory address}";
	local _study_initialOwner="${2:?Undefined Zorp Study owner address}";
	local _study_encryptionKey="${3:?Undefined Zorp Study encryption key}";

	local _args=(
		call "${_zorp_factory_address}"
		--rpc-url "${_test_net_url}"
		--private-key "${_test_private_key0}"
		--value "1ether"
		'createStudy(address,string)(address)'
			"${_study_initialOwner}"
			"${_study_encryptionKey}"
	);

	if ((__VERBOSE__)); then
		printf >&2 'ZorpFactory_createStudy command --->\ncast %s\n<--- ZorpFactory_createStudy command\n' "${_args[*]}";
	fi

	cast "${_args[@]}";
}

##
# Publish `ZorpStudy` to Anvil and return contract address
ZorpStudy_constructor() {
	local -a _args=(
		create
		--broadcast
		--rpc-url "${_test_net_url}"
		--private-key "${_test_private_key0}"
		src/ZorpStudy.sol:ZorpStudy
		--value "1ether"
		--constructor-args "${_initialOwner}" "${_encryptionKey}"
	);

	pushd "${__G_DIR__}/zorp-contracts" 1>/dev/null 2>&1;

	if ((__VERBOSE__)); then
		printf >&2 'ZorpStudy_publish command --->\nforge %s\n<--- ZorpStudy_publish command\n' "${_args[*]}";
	fi

	local _result;
	_result="$( forge "${_args[@]}" )";
	popd 1>/dev/null 2>&1;

	if ((__VERBOSE__)); then
		printf >&2 'ZorpStudy_publish result --->\n%s\n<--- ZorpStudy_publish result\n' "${_result:?Undefined result}";
	fi

	awk '{
		if ($0 ~ "Deployed to:") {
			print $3;
			exit 0;
		}
	}' <<<"${_result}";
}

## Do the thangs
_zorp_factory_address="$( ZorpFactory_constructor )";
printf >&2 '_zorp_factory_address -> %s\n' "${_zorp_factory_address}"

_zorp_study_addresses=();
for i in "${!_study_initialOwners[@]}"; do
	_study_initialOwner="${_study_initialOwners[${i}]}";
	_zorp_study_address="$( ZorpFactory_createStudy "${_zorp_factory_address}" "${_study_initialOwner}" "${i}" )";
	printf >&2 'i -> %i | _study_initialOwner -> %s | _zorp_study_address -> %s\n' "${i}" "${_study_initialOwner}" "${_zorp_study_address}";
	_zorp_study_addresses+=( "${_zorp_study_address}" );
done

_zorp_studies="$( ZorpFactory_paginateStudies "${_zorp_factory_address}" )";
printf >&2 '_zorp_studies -> %s\n' "${_zorp_studies}"

_zorp_study_address="$( ZorpStudy_constructor )";
printf >&2 '_zorp_study_address -> %s\n' "${_zorp_study_address}"

