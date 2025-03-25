// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol";

import { ZorpFactory } from "../src/ZorpFactory.sol";
import {
    IZorpFactory,
    FactoryUpdated,
    StudyCreated
} from "../src/IZorpFactory.sol";


contract ZorpFactory_Success_Read_Test is Test {
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

    function test_read__VERSION() public view {
        uint256 expected = 1;
        uint256 got = IZorpFactory(ref_factory).VERSION();
        vm.assertEq(expected, got, "Unexpected: `ZorpFactory.VERSION()`");
    }

    function test_read__latest_study_index() public view {
        uint256 expected = 0;
        uint256 got = IZorpFactory(ref_factory).latest_study_index();
        vm.assertEq(expected, got, "Unexpected: `ZorpFactory.latest_study_index()`");
    }

    function test_read__studies() public view {
        address expected = address(0);
        address got = IZorpFactory(ref_factory).studies(0);
        vm.assertEq(expected, got, "Unexpected: `ZorpFactory.studies(0)`");
    }

    function test_read__ref_factory_previous() public view {
        address expected = address(0);
        address got = IZorpFactory(ref_factory).ref_factory_previous();
        vm.assertEq(expected, got, "Unexpected: `ZorpFactory.ref_factory_previous()`");
    }

    function test_read__ref_factory_next() public view {
        address expected = address(0);
        address got = IZorpFactory(ref_factory).ref_factory_next();
        vm.assertEq(expected, got, "Unexpected: `ZorpFactory.ref_factory_next()`");
    }
}

contract ZorpFactory_FakeUpdate is ZorpFactory {
    constructor (address payable initialOwner_, address _ref_factory_previous) ZorpFactory(initialOwner_) {
        ref_factory_previous = _ref_factory_previous;
    }
}

/// @dev see: https://book.getfoundry.sh/cheatcodes/expect-emit
contract ZorpFactory_Success_Write_Test is Test {
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

    function test_write__createStudy() public {
        address payable initialOwner = payable(address(68));
        string memory encryptionKey = "wat";
        uint256 msg_value = 1;

        // Note: knowing the emit-ed address ahead of time is not feasible
        vm.expectEmit(false, false, false, true, ref_factory);
        emit StudyCreated(address(1336));
        address ref_study = IZorpFactory(ref_factory).createStudy{ value: msg_value }(initialOwner, encryptionKey);

        uint256 index_study = IZorpFactory(ref_factory).latest_study_index();
        address expected_study_ref = IZorpFactory(ref_factory).studies(index_study);
        vm.assertEq(expected_study_ref, ref_study, "Unexpected: `ZorpFactory.studies(index_study)`");
    }

    function test_write__setRefFactoryNext() public {
        address new_ref_factory = address(new ZorpFactory_FakeUpdate(ZORP_FACTORY__OWNER, ref_factory));

        vm.expectEmit(true, true, true, true, ref_factory);
        emit FactoryUpdated(ref_factory, new_ref_factory);
        IZorpFactory(ref_factory).setRefFactoryNext(new_ref_factory);

        vm.assertEq(new_ref_factory, IZorpFactory(ref_factory).ref_factory_next(), "Unexpected: `ZorpFactory.ref_factory_next()`");

        vm.assertEq(address(0), IZorpFactory(new_ref_factory).ref_factory_next(), "Unexpected: `ZorpFactory_FakeUpdate.ref_factory_next()`");
        vm.assertEq(ref_factory, IZorpFactory(new_ref_factory).ref_factory_previous(), "Unexpected: `ZorpFactory_FakeUpdate.ref_factory_previous()`");
    }

    function test_write__withdraw() public {
        address payable to = payable(address(0xb0ba7ea));
        uint256 amount = 41968;

        (bool paid, ) = ref_factory.call{ value: amount }("");

        IZorpFactory(ref_factory).withdraw(to, amount);

        vm.assertTrue(paid, "Unexpected: `paid` value from `ref_factory.call{ value: amount }(\"\")`");
        vm.assertEq(amount, address(to).balance, "Unexpected: `ZorpFactory.withdraw(to, amount)`");
    }

    function test_write__paginateSubmittedData() public {
        address payable initialOwner = payable(address(68));
        string memory encryptionKey = "wat";
        uint256 msg_value = 1;

        address ref_study = IZorpFactory(ref_factory).createStudy{ value: msg_value }(initialOwner, encryptionKey);

        string[] memory results = new string[](10);
        results = IZorpFactory(ref_factory).paginateSubmittedData(ref_study, 1, 10);

        for (uint256 i; i < results.length;) {
            vm.assertEq("", results[i], "Unexpected: `results[i]` from `ZorpFactory.paginateSubmittedData(ref_study, 1, 10)`");
            unchecked { ++i; }
        }
    }

    function test_write__paginateParticipantStatus() public {
        address payable initialOwner = payable(address(68));
        string memory encryptionKey = "wat";
        uint256 msg_value = 1;

        address ref_study = IZorpFactory(ref_factory).createStudy{ value: msg_value }(initialOwner, encryptionKey);

        uint256[] memory results = new uint256[](10);
        results = IZorpFactory(ref_factory).paginateParticipantStatus(ref_study, 1, 10);

        for (uint256 i; i < results.length;) {
            vm.assertEq(0, results[i], "Unexpected: `results[i]` from `ZorpFactory.paginateParticipantStatus(ref_study, 1, 10)`");
            unchecked { ++i; }
        }
    }

    function test_write__paginateStudies() public {
        address payable initialOwner = payable(address(68));
        string memory encryptionKey = "wat";
        uint256 msg_value = 1;

        address[] memory ref_studies_expected = new address[](10);
        for (uint256 i; i < ref_studies_expected.length; ) {
            ref_studies_expected[i] = IZorpFactory(ref_factory).createStudy{ value: msg_value }(initialOwner, encryptionKey);
            unchecked { ++i; }
        }

        address[] memory results = new address[](10);
        results = IZorpFactory(ref_factory).paginateStudies(1, 10);

        for (uint i; i < results.length;) {
            vm.assertEq(ref_studies_expected[i], results[i], "Unexpected: `results[i]` from `ZorpFactory(ref_factory).paginateStudies(1, 10)`");
            unchecked { ++i; }
        }
    }
}

