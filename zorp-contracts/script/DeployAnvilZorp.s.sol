// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Script.sol";

import { ZorpFactory } from "../src/ZorpFactory.sol";
import { IZorpFactory } from "../src/IZorpFactory.sol";

/// ## Example `forge` usage
///
/// ```bash
/// _test_net_url='127.0.0.1:8545';
/// _test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
///
/// forge script -vvvvv \
///   --broadcast \
///   --rpc-url "${_test_net_url}" \
///   --private-key "${_test_private_key0}" \
///   src/DeployAnvil.sol:DeployAnvil;
/// ```
///
/// ## Expected results if running on fresh Anvil node
///
/// ```
/// ZorpFactory:  0x5FbDB2315678afecb367f032d93F642f64180aa3
/// ZorpStudy:  0xa16E02E87b7454126E5E10d957A927A7F5B5d2be
/// ZorpStudy:  0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968
/// ZorpStudy:  0xeEBe00Ac0756308ac4AaBfD76c05c4F3088B8883
/// ZorpStudy:  0x10C6E9530F1C1AF873a391030a1D9E8ed0630D26
/// ZorpStudy:  0x603E1BD79259EbcbAaeD0c83eeC09cA0B89a5bcC
/// ZorpStudy:  0x86337dDaF2661A069D0DcB5D160585acC2d15E9a
/// ZorpStudy:  0x9CfA6D15c80Eb753C815079F2b32ddEFd562C3e4
/// ZorpStudy:  0x427f7c59ED72bCf26DfFc634FEF3034e00922DD8
/// ZorpStudy:  0x275039fc0fd2eeFac30835af6aeFf24e8c52bA6B
/// ```
///
/// @custom:link https://github.com/foundry-rs/foundry/blob/54af8693b8fcc7a3f65136c1188e89661155955d/crates/cast/tests/cli/main.rs#L419
/// @custom:link https://book.getfoundry.sh/reference/anvil/
/// @custom:link https://github.com/foundry-rs/foundry/issues/2519
contract DeployAnvilZorp is Script {
    address payable public constant ZorpFactory_Owner = payable(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));

    address[] public ZorpStudy_OwnerList = [
        address(0xd6c12888363B422e72647FB95c97fE007C8a7870),
        address(0x612952ab356E692723100b9e91d7cCA209bB4D69),
        address(0x3A5b8058b73d6F93b71A46a697Ea35f165bc72A8),
        address(0xd50dAfCdB28687B78182566118A53B45e54298e7),
        address(0xA6606c82e02337Bd952de5db38104569134B95bd),
        address(0x0e9A6f6aBb4a46767515F07d15229755Ac16BFbf),
        address(0x1ebE2DC576b1320f8a20a6f4D50Aa9FA183436b2),
        address(0x021542581584b215947efaED00778F79b2e8Fb6D),
        address(0xF4eF5E0f51dA631Ea5fCc7AB2Cb1F98503f571C3)
    ];

    // Warn: the following are not at all correct!
    string[] public ZorpStudy_GpgCidList = [
        "0xd6c12888363B422e72647FB95c97fE007C8a7870",
        "0x612952ab356E692723100b9e91d7cCA209bB4D69",
        "0x3A5b8058b73d6F93b71A46a697Ea35f165bc72A8",
        "0xd50dAfCdB28687B78182566118A53B45e54298e7",
        "0xA6606c82e02337Bd952de5db38104569134B95bd",
        "0x0e9A6f6aBb4a46767515F07d15229755Ac16BFbf",
        "0x1ebE2DC576b1320f8a20a6f4D50Aa9FA183436b2",
        "0x021542581584b215947efaED00778F79b2e8Fb6D",
        "0xF4eF5E0f51dA631Ea5fCc7AB2Cb1F98503f571C3"
    ];

    function run() external {
        vm.startBroadcast();

        // vm.createSelectFork(vm.rpcUrl("anvil"));
        address factory = address(new ZorpFactory(ZorpFactory_Owner));
        console2.log("ZorpFactory: ", factory);

        for (uint256 i; i < ZorpStudy_OwnerList.length;) {
            address study = address(IZorpFactory(factory).createStudy{value: 1 ether}(payable(ZorpStudy_OwnerList[i]), ZorpStudy_GpgCidList[i]));
            console2.log("ZorpStudy: ", study);
            unchecked { ++i; }
        }

        vm.stopBroadcast();
    }
}

