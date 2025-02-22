// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol";

import { ZorpFactory } from "../src/ZorpFactory.sol";
import { Participant, ZorpStudy } from "../src/ZorpStudy.sol";

contract ZorpTest is Test {
    ZorpFactory factory;

    function setUp() public {
        // Deploy a fresh factory for each test
        factory = new ZorpFactory();
    }

    function testCreateStudy() public {
        // Call createStudy
        address newStudy = factory.createStudy();
        // Check that we got a valid address
        assertTrue(newStudy != address(0), "Study address should not be zero");

        // Optionally check if allStudies array length is 1
        uint256 count = factory.getStudyCount();
        assertEq(count, 1, "There should be exactly one study created");
    }
}
