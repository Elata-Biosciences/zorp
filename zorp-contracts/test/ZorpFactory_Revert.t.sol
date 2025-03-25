// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol";

import { ZorpFactory } from "../src/ZorpFactory.sol";
import {
    FactoryUpdated,
    FactoryUpdatedAlready,
    IZorpFactory,
    StudyCreated,
    WithdrawFailed
} from "../src/IZorpFactory.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZorpFactory_FakeUpdate is ZorpFactory {
    constructor (address payable initialOwner_, address _ref_factory_previous) ZorpFactory(initialOwner_) {
        ref_factory_previous = _ref_factory_previous;
        VERSION = IZorpFactory(_ref_factory_previous).VERSION() + 1;
    }
}

contract ZorpFactory_Proxy is Ownable, ReentrancyGuard {
    constructor(address initialOwner_) Ownable(initialOwner_) {}

    function withdrawFrom(address ref_factory, address payable to, uint256 amount) external payable nonReentrant onlyOwner {
        IZorpFactory(ref_factory).withdraw(to, amount);
    }

    function transferOwnershipOf(address ref_factory, address newOwner) external payable onlyOwner {
        IZorpFactory(ref_factory).transferOwnership(newOwner);
    }

    receive() external payable {}
    fallback() external payable {}
}

contract ZorpFactory_Attacker is Ownable, ReentrancyGuard {
    constructor(address initialOwner_) Ownable(initialOwner_) {}

    function withdraw(address payable to, uint256 amount) external payable nonReentrant onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert WithdrawFailed(to, amount, address(this).balance);
        }
    }

    function attack(address ref_factory, uint256 amount) external payable onlyOwner {
        IZorpFactory(ref_factory).withdraw(payable(address(this)), amount);
    }

    // receive() external payable {}
    fallback() external payable {
        if (msg.sender.balance > 0) {
            IZorpFactory(msg.sender).withdraw(payable(address(this)), msg.sender.balance);
        }
    }
}

contract ZorpFactory_Revert_Write_Test is Test {
    address payable immutable ZORP_FACTORY__OWNER;
    address ref_factory;

    constructor() {
        ZORP_FACTORY__OWNER = payable(address(this));
    }

    function setUp() public {
        vm.deal(address(this), 1000 ether);
        // Deploy a fresh factory for each test
        ref_factory = address(new ZorpFactory(ZORP_FACTORY__OWNER));
    }

    function test_write__setRefFactoryNext__rejects_when_previously_upgraded() public {
        address new_ref_factory = address(new ZorpFactory_FakeUpdate(ZORP_FACTORY__OWNER, ref_factory));

        vm.expectEmit(true, true, true, true, ref_factory);
        emit FactoryUpdated(ref_factory, new_ref_factory);
        IZorpFactory(ref_factory).setRefFactoryNext(new_ref_factory);

        address bad_address = address(1336);
        vm.expectRevert(abi.encodeWithSelector(FactoryUpdatedAlready.selector, new_ref_factory, bad_address), ref_factory);
        IZorpFactory(ref_factory).setRefFactoryNext(bad_address);
    }

    function test_write__withdraw__rejects_when_balance_is_insufficient() public {
        uint256 amount_deposit = 1 ether;
        (bool deposit_success, ) = ref_factory.call{ value: amount_deposit }("");
        vm.assertTrue(deposit_success, "Unexpected: failure with `ref_factory.call{ value: amount_deposit }(\"\")`");

        uint256 amount_withdraw = amount_deposit + 41968;
        address payable to = ZORP_FACTORY__OWNER;

        vm.expectRevert(abi.encodeWithSelector(WithdrawFailed.selector, to, amount_withdraw, address(ref_factory).balance));
        IZorpFactory(ref_factory).withdraw(to, amount_withdraw);
    }

    function test_write__withdraw__rejects_non_owner() public {
        uint256 amount = 1 ether;

        ZorpFactory_Proxy factory_proxy = new ZorpFactory_Proxy(ZORP_FACTORY__OWNER);
        IZorpFactory(ref_factory).transferOwnership(address(factory_proxy));

        uint256 balance_factory_before = ref_factory.balance;
        uint256 balance_owner_before = ZORP_FACTORY__OWNER.balance;

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, ZORP_FACTORY__OWNER), ref_factory);
        IZorpFactory(ref_factory).withdraw(ZORP_FACTORY__OWNER, amount);

        vm.assertEq(balance_factory_before, ref_factory.balance, "Unexpected: change of `ref_factory.balance`");
        vm.assertEq(balance_owner_before, ZORP_FACTORY__OWNER.balance, "Unexpected: change of `ZORP_FACTORY__OWNER.balance`");
    }

    /// @dev Note this is just a formality as `onlyOwner` _should_ also work to prevent wallet draining by `to` address reentry
    function test_write__withdraw__rejects_reentry_by_non_owner() public {
        uint256 amount_deposit = 10 ether;
        (bool deposit_success, ) = ref_factory.call{ value: amount_deposit }("");
        vm.assertTrue(deposit_success, "Unexpected: failure with `ref_factory.call{ value: amount_deposit }(\"\")`");

        ZorpFactory_Attacker factory_attacker = new ZorpFactory_Attacker(ZORP_FACTORY__OWNER);

        address payable to = payable(address(factory_attacker));
        uint256 amount_withdraw = 4.19 ether;
        uint256 balance_factory_before = ref_factory.balance;
        uint256 balance_owner_before = ZORP_FACTORY__OWNER.balance;
        uint256 balance_attacker_before = to.balance;

        vm.expectRevert(abi.encodeWithSelector(WithdrawFailed.selector, to, amount_withdraw, balance_factory_before), ref_factory);
        IZorpFactory(ref_factory).withdraw(to, amount_withdraw);

        vm.assertEq(balance_factory_before, ref_factory.balance, "Unexpected: change of `ref_factory.balance`");
        vm.assertEq(balance_owner_before, ZORP_FACTORY__OWNER.balance, "Unexpected: change of `ZORP_FACTORY__OWNER.balance`");
        vm.assertEq(balance_attacker_before, to.balance, "Unexpected: change of `to.balance`");
    }

    function test_write__withdraw__rejects_reentry_by_owner() public {
        uint256 amount_deposit = 10 ether;
        (bool deposit_success, ) = ref_factory.call{ value: amount_deposit }("");
        vm.assertTrue(deposit_success, "Unexpected: failure with `ref_factory.call{ value: amount_deposit }(\"\")`");

        ZorpFactory_Attacker factory_attacker = new ZorpFactory_Attacker(ZORP_FACTORY__OWNER);
        IZorpFactory(ref_factory).transferOwnership(address(factory_attacker));

        address payable to = payable(address(factory_attacker));
        uint256 amount_withdraw = 4.19 ether;
        uint256 balance_factory_before = ref_factory.balance;
        uint256 balance_owner_before = ZORP_FACTORY__OWNER.balance;
        uint256 balance_attacker_before = to.balance;

        /* @TODO maybe find a way to expect lower-level reverts */
        // vm.expectRevert(abi.encodeWithSelector(ReentrancyGuard.ReentrancyGuardReentrantCall.selector), ref_factory);
        vm.expectRevert(abi.encodeWithSelector(WithdrawFailed.selector, to, amount_withdraw, balance_factory_before), ref_factory);
        factory_attacker.attack(ref_factory, amount_withdraw);

        vm.assertEq(balance_factory_before, ref_factory.balance, "Unexpected: change of `ref_factory.balance`");
        vm.assertEq(balance_owner_before, ZORP_FACTORY__OWNER.balance, "Unexpected: change of `ZORP_FACTORY__OWNER.balance`");
        vm.assertEq(balance_attacker_before, to.balance, "Unexpected: change of `to.balance`");
    }

    /// @dev Following two function are required to reclaim funds when executing `IZorpStudy.endStudy()`
    receive() external payable {}
    fallback() external payable {}
}

