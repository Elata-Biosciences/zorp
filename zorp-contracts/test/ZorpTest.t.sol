// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// TODO: https://book.getfoundry.sh/forge/fuzz-testing

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
        address newStudy = factory.createStudy(
            address(this),
            "0xDEADBEEF"
        );
        // Check that we got a valid address
        assertTrue(newStudy != address(0), "Study address should not be zero");

        // Optionally check if allStudies array length is 1
        uint256 count = factory.getStudyCount();
        assertEq(count, 1, "There should be exactly one study created");

        string memory encryptionKey = ZorpStudy(newStudy).encryptionKey();
        assertEq(encryptionKey, "0xDEADBEEF", "Failed to retrieve store encryption key");
    }

    function test_ZorpStudy_startStudy() public {
        address newStudy = factory.createStudy(
            address(this),
            "0xDEADBEEF"
        );

        ZorpStudy(newStudy).startStudy();
        assertEq(ZorpStudy(newStudy).study_status(), ZorpStudy(newStudy).STUDY_STATUS__ACTIVE(), "Failed to set expected study status");

        try ZorpStudy(newStudy).startStudy() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study was previously activated");
        }
    }

    function test_ZorpStudy_endStudy() public {
        address newStudy = factory.createStudy(
            address(this),
            "0xDEADBEEF"
        );

        try ZorpStudy(newStudy).endStudy() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }

        ZorpStudy(newStudy).startStudy();

        ZorpStudy(newStudy).endStudy();
        assertEq(ZorpStudy(newStudy).study_status(), ZorpStudy(newStudy).STUDY_STATUS__FINISHED(), "Failed to set expected study status");

        try ZorpStudy(newStudy).endStudy() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }
    }

    function test_ZorpStudy_submitData() public {
        address newStudy = factory.createStudy(
            address(this),
            "0xDEADBEEF"
        );

        string memory ipfs_cid = "CAFEBABE";

        try ZorpStudy(newStudy).submitData(ipfs_cid) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }

        ZorpStudy(newStudy).startStudy();

        try ZorpStudy(newStudy).submitData("") {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid IPFS CID");
        }

        ZorpStudy(newStudy).submitData(ipfs_cid);

        try ZorpStudy(newStudy).submitData(ipfs_cid) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid status for message sender");
        }

        assertEq(ZorpStudy(newStudy).submissions(), 1, "Failed to increase submission count");

        uint256 index = ZorpStudy(newStudy).submissions();
        // TODO: maybe consider not using a struct?
        (address stored_account, string memory stored_ipfs_cid) = ZorpStudy(newStudy).participants(index);
        assertEq(stored_account, address(this), "Failed to retrieve expected participant account");
        assertEq(stored_ipfs_cid, ipfs_cid, "Failed to retrieve expected participant IPFS CID");
    }

    function test_ZorpStudy_flagInvalidSubmission() public {
        address newStudy = factory.createStudy(
            address(this),
            "0xDEADBEEF"
        );

        ZorpStudy(newStudy).startStudy();

        try ZorpStudy(newStudy).flagInvalidSubmission(address(this)) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid status for participant");
        }

        string memory ipfs_cid = "CAFEBABE";
        ZorpStudy(newStudy).submitData(ipfs_cid);

        ZorpStudy(newStudy).flagInvalidSubmission(address(this));

        try ZorpStudy(newStudy).flagInvalidSubmission(address(this)) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid status for participant");
        }

        try ZorpStudy(newStudy).submitData(ipfs_cid) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid status for message sender");
        }

        ZorpStudy(newStudy).endStudy();

        try ZorpStudy(newStudy).submitData(ipfs_cid) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }

        assertEq(ZorpStudy(newStudy).invalidated(), 1, "Failed to increase invalidated count");
        assertEq(ZorpStudy(newStudy).participant_status(address(this)), ZorpStudy(newStudy).PARTICIPANT_STATUS__INVALID(), "Failed to invalidate participant");
    }

    function test_ZorpStudy_claimReward() public {
        revert("TODO: This needs implmented then tested");
    }
}
