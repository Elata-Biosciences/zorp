// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// TODO: https://book.getfoundry.sh/forge/fuzz-testing

import { Test } from "forge-std/Test.sol";

import { ZorpFactory } from "../src/ZorpFactory.sol";
import { IZorpStudy } from "../src/IZorpStudy.sol";

contract ZorpTest is Test {
    ZorpFactory factory;

    address payable immutable ZORP_FACTORY__OWNER;

    address payable immutable ZORP_STUDY__OWNER;

    address payable immutable ZORP_STUDY__PARTICIPANT__GOOD;
    address payable immutable ZORP_STUDY__PARTICIPANT__BAD;

    string ZORP_STUDY__ENCRYPTION_KEY;
    string ZORP_STUDY__DATA__GOOD;

    constructor() {
        ZORP_FACTORY__OWNER = payable(address(this));
        ZORP_STUDY__OWNER = payable(address(this));
        ZORP_STUDY__PARTICIPANT__GOOD = payable(address(this));
        ZORP_STUDY__PARTICIPANT__BAD = payable(address(this));
        ZORP_STUDY__ENCRYPTION_KEY = "0xDEADBEEF";
        ZORP_STUDY__DATA__GOOD = "CAFEBABE";
    }

    /// @dev Following two function are required to reclaim funds when executing `IZorpStudy.endStudy()`
    receive() external payable {}
    fallback() external payable {}

    function setUp() public {
        // Deploy a fresh factory for each test
        factory = new ZorpFactory(payable(address(this)));
        vm.deal(address(this), 1000 ether);
    }

    function createFundedStudy(address payable initialOwner, string memory encryptionKey) internal returns (address) {
        return factory.createStudy{value: 1 ether}(initialOwner, encryptionKey);
    }

    function testCreateStudy() public {
        // Call createStudy
        address newStudy = createFundedStudy(ZORP_STUDY__OWNER, ZORP_STUDY__ENCRYPTION_KEY);
        assertTrue(newStudy != address(0), "Study address should not be zero");

        // Optionally check if allStudies array length is 1
        uint256 count = factory.getStudyCount();
        assertEq(count, 1, "There should be exactly one study created");

        assertEq(IZorpStudy(newStudy).encryptionKey(), ZORP_STUDY__ENCRYPTION_KEY, "Failed to retrieve store encryption key");
        assertTrue(newStudy.balance > 0, "Failed to transfer any funds to study?!");
    }

    function test_ZorpStudy_startStudy() public {
        address newStudy = createFundedStudy(ZORP_STUDY__OWNER, ZORP_STUDY__ENCRYPTION_KEY);

        IZorpStudy(newStudy).startStudy();
        assertEq(IZorpStudy(newStudy).study_status(), IZorpStudy(newStudy).STUDY_STATUS__ACTIVE(), "Failed to set expected study status");

        try IZorpStudy(newStudy).startStudy() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study was previously activated");
        }
    }

    function test_ZorpStudy_endStudy() public {
        address newStudy = createFundedStudy(ZORP_STUDY__OWNER, ZORP_STUDY__ENCRYPTION_KEY);

        try IZorpStudy(newStudy).endStudy() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }

        IZorpStudy(newStudy).startStudy();

        IZorpStudy(newStudy).endStudy();
        assertEq(IZorpStudy(newStudy).study_status(), IZorpStudy(newStudy).STUDY_STATUS__FINISHED(), "Failed to set expected study status");

        try IZorpStudy(newStudy).endStudy() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }
    }

    function test_ZorpStudy_submitData() public {
        address newStudy = createFundedStudy(ZORP_STUDY__OWNER, ZORP_STUDY__ENCRYPTION_KEY);

        try IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }

        IZorpStudy(newStudy).startStudy();

        try IZorpStudy(newStudy).submitData("") {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid IPFS CID");
        }

        IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD);

        try IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid message sender status");
        }

        assertEq(IZorpStudy(newStudy).submissions(), 1, "Failed to increase submission count");

        uint256 index = IZorpStudy(newStudy).submissions();
        // TODO: maybe consider not using a struct?
        string memory stored_ipfs_cid = IZorpStudy(newStudy).submitted_data(index);
        assertEq(stored_ipfs_cid, ZORP_STUDY__DATA__GOOD, "Failed to retrieve expected participant IPFS CID");
    }

    function test_ZorpStudy_flagInvalidSubmission() public {
        address newStudy = createFundedStudy(ZORP_STUDY__OWNER, ZORP_STUDY__ENCRYPTION_KEY);

        IZorpStudy(newStudy).startStudy();

        try IZorpStudy(newStudy).flagInvalidSubmission(ZORP_STUDY__PARTICIPANT__BAD) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid participant status");
        }

        IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD);

        IZorpStudy(newStudy).flagInvalidSubmission(ZORP_STUDY__PARTICIPANT__BAD);

        uint256 index = IZorpStudy(newStudy).submissions();
        string memory stored_ipfs_cid = IZorpStudy(newStudy).submitted_data(index);
        assertEq(stored_ipfs_cid, "", "Failed to clear submitted_data");
        assertEq(IZorpStudy(newStudy).participant_index(ZORP_STUDY__PARTICIPANT__BAD), 0, "Failed to clear participant_index");

        try IZorpStudy(newStudy).flagInvalidSubmission(ZORP_STUDY__PARTICIPANT__BAD) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid participant status");
        }

        try IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid message sender status");
        }

        IZorpStudy(newStudy).endStudy();

        try IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD) {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not active");
        }

        assertEq(IZorpStudy(newStudy).invalidated(), 1, "Failed to increase invalidated count");
        assertEq(IZorpStudy(newStudy).participant_status(ZORP_STUDY__PARTICIPANT__BAD), IZorpStudy(newStudy).PARTICIPANT_STATUS__INVALID(), "Failed to invalidate participant");
    }

    function test_ZorpStudy_claimReward() public {
        address newStudy = createFundedStudy(ZORP_STUDY__OWNER, ZORP_STUDY__ENCRYPTION_KEY);

        try IZorpStudy(newStudy).claimReward() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Study not finished");
        }

        IZorpStudy(newStudy).startStudy();

        IZorpStudy(newStudy).submitData(ZORP_STUDY__DATA__GOOD);

        IZorpStudy(newStudy).endStudy();

        IZorpStudy(newStudy).claimReward();

        try IZorpStudy(newStudy).claimReward() {
            revert("Failed to fail test");
        } catch Error(string memory reason) {
            assertEq(reason, "ZorpStudy: Invalid message sender status");
        }
    }
}
