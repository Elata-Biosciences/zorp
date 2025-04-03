// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol";

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { WithdrawFailed } from "../src/IZorpFactory.sol";

import { IZorpStudy } from "../src/IZorpStudy.sol";
import { ZorpStudy } from "../src/ZorpStudy.sol";

contract ZorpStudy_Success_Read_Test is Test {
    address payable immutable ZORP_STUDY__OWNER;
    address payable immutable ZORP_STUDY__PARTICIPANT;
    string ZORP_STUDY__IPFS_CID;
    address ref_study;

    constructor() {
        ZORP_STUDY__OWNER = payable(address(this));
        ZORP_STUDY__PARTICIPANT = payable(address(this));
        ZORP_STUDY__IPFS_CID = "0xDEADBEEF";
    }

    function setUp() public {
        vm.deal(address(this), 1000 ether);
        // Deploy a fresh study for each test
        uint256 amount = 1 ether;
        ref_study = address(new ZorpStudy{ value: amount }(ZORP_STUDY__OWNER, ZORP_STUDY__IPFS_CID));
    }

    function test_read__creator() public view {
        vm.assertEq(address(this), IZorpStudy(ref_study).creator(), "Unexpected: `ZorpStudy.creator()`");
    }

    function test_read__submissions() public view {
        vm.assertEq(0, IZorpStudy(ref_study).submissions(), "Unexpected: `ZorpStudy.submissions()`");
    }

    function test_read__invalidated() public view {
        vm.assertEq(0, IZorpStudy(ref_study).invalidated(), "Unexpected: `ZorpStudy.invalidated()`");
    }

    function test_read__study_status() public view {
        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__NA(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    function test_read__participant_payout_amount() public view {
        vm.assertEq(0, IZorpStudy(ref_study).participant_payout_amount(), "Unexpected: `ZorpStudy.participant_payout_amount()`");
    }

    function test_read__encryption_key() public view {
        vm.assertEq(ZORP_STUDY__IPFS_CID, IZorpStudy(ref_study).encryption_key(), "Unexpected: `ZorpStudy.encryption_key()`");
    }

    function test_read__participant_status() public view {
        vm.assertEq(IZorpStudy(ref_study).PARTICIPANT_STATUS__NA(), IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT), "Unexpected: `ZorpStudy.participant_status(ZORP_STUDY__PARTICIPANT)`");
    }

    function test_read__participant_index() public view {
        vm.assertEq(0, IZorpStudy(ref_study).participant_index(ZORP_STUDY__PARTICIPANT), "Unexpected: `ZorpStudy.participant_index(ZORP_STUDY__PARTICIPANT)`");
    }

    function test_read__submitted_data() public view {
        uint256 index = 0;
        vm.assertEq("", IZorpStudy(ref_study).submitted_data(index), "Unexpected: `ZorpStudy.submitted_data(index)`");
    }
}

/// Used for generating new addresses that can interact with target ZorpStudy instance
contract ZorpStudy_SubmitterProxy is Ownable, ReentrancyGuard {
    constructor (address initialOwner_) payable Ownable(initialOwner_) { }

    function submitData(address ref_study, string memory ipfs_cid) external payable {
        IZorpStudy(ref_study).submitData(ipfs_cid);
    }

    function claimReward(address ref_study) external payable onlyOwner {
        IZorpStudy(ref_study).claimReward();
    }

    function withdraw(address payable to, uint256 amount) external payable nonReentrant onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert WithdrawFailed(to, amount, address(this).balance);
        }
    }

    receive() external payable {}
    fallback() external payable {}
}

contract ZorpStudy_Success_Write_Test is Test {
    address payable immutable ZORP_STUDY__OWNER;
    address payable immutable ZORP_STUDY__PARTICIPANT;
    string ZORP_STUDY__IPFS_CID;
    address ref_study;

    constructor() {
        ZORP_STUDY__OWNER = payable(address(this));
        ZORP_STUDY__PARTICIPANT = payable(address(this));
        ZORP_STUDY__IPFS_CID = "0xDEADBEEF";
        ZORP_STUDY__IPFS_CID = "0xCAFEBABE";
    }

    function setUp() public {
        vm.deal(address(this), 1000 ether);
        // Deploy a fresh study for each test
        uint256 amount = 1 ether;
        ref_study = address(new ZorpStudy{ value: amount }(ZORP_STUDY__OWNER, ZORP_STUDY__IPFS_CID));
    }

    function test_write__submitData() public {
        IZorpStudy(ref_study).startStudy();

        IZorpStudy(ref_study).submitData(ZORP_STUDY__IPFS_CID);

        uint256 index_submitter = IZorpStudy(ref_study).participant_index(address(this));

        vm.assertEq(1, index_submitter, "Unexpected: `IZorpStudy(ref_study).participant_index(address(this))`");
        vm.assertEq(address(this), IZorpStudy(ref_study).index_participant(index_submitter), "Unexpected: `IZorpStudy(ref_study).index_participant(index_submitter)`");
        vm.assertEq(1, IZorpStudy(ref_study).submissions(), "Unexpected: `ZorpStudy.submissions()`");
        vm.assertEq(ZORP_STUDY__IPFS_CID, IZorpStudy(ref_study).submitted_data(index_submitter), "Unexpected: `IZorpStudy(ref_study).submitted_data(index_submitter)`");
        vm.assertEq(IZorpStudy(ref_study).PARTICIPANT_STATUS__SUBMITTED(), IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT), "Unexpected: `IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT)`");
    }

    function test_write__claimReward() public {
        IZorpStudy(ref_study).startStudy();

        IZorpStudy(ref_study).submitData(ZORP_STUDY__IPFS_CID);

        IZorpStudy(ref_study).endStudy();

        uint256 submissions = IZorpStudy(ref_study).submissions();
        vm.assertEq(1, submissions, "Unexpected: `IZorpStudy(ref_study).submissions()`");

        uint256 invalidated = IZorpStudy(ref_study).invalidated();
        vm.assertEq(0, invalidated, "Unexpected: `IZorpStudy(ref_study).invalidated()`");

        uint256 participant_payout_amount_expected = ref_study.balance / (submissions - invalidated);
        vm.assertEq(participant_payout_amount_expected, IZorpStudy(ref_study).participant_payout_amount(), "Unexpected: `IZorpStudy(ref_study).participant_payout_amount()`");

        vm.assertEq(IZorpStudy(ref_study).PARTICIPANT_STATUS__SUBMITTED(), IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT), "Unexpected: `IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT)`");
        IZorpStudy(ref_study).claimReward();
        vm.assertEq(IZorpStudy(ref_study).PARTICIPANT_STATUS__PAID(), IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT), "Unexpected: `IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT)`");

        vm.assertEq(0, ref_study.balance, "Unexpected: `ref_study.balance`");
        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__FINISHED(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    function test_write__claimReward__with_terminating_fractional_submissions() public {
        IZorpStudy(ref_study).startStudy();

        uint256 amount_of_submitters = 10;
        ZorpStudy_SubmitterProxy[] memory submiter_proxies = new ZorpStudy_SubmitterProxy[](amount_of_submitters);
        for (uint256 i; i < amount_of_submitters; ) {
            ZorpStudy_SubmitterProxy submiter_proxy = new ZorpStudy_SubmitterProxy(ZORP_STUDY__PARTICIPANT);
            submiter_proxies[i] = submiter_proxy;

            submiter_proxy.submitData(ref_study, ZORP_STUDY__IPFS_CID);

            unchecked { ++i; }
        }

        uint256 owner_balance_before = ZORP_STUDY__OWNER.balance;
        IZorpStudy(ref_study).endStudy();
        uint256 owner_balance_after = ZORP_STUDY__OWNER.balance;

        vm.assertTrue(owner_balance_before == owner_balance_after, "Unexpected: `ZORP_STUDY__OWNER.balance`");

        uint256 submissions = IZorpStudy(ref_study).submissions();
        vm.assertEq(amount_of_submitters, submissions, "Unexpected: `IZorpStudy(ref_study).submissions()`");

        uint256 invalidated = IZorpStudy(ref_study).invalidated();
        vm.assertEq(0, invalidated, "Unexpected: `IZorpStudy(ref_study).invalidated()`");

        uint256 participant_payout_amount_expected = ref_study.balance / (submissions - invalidated);
        vm.assertEq(participant_payout_amount_expected, IZorpStudy(ref_study).participant_payout_amount(), "Unexpected: `IZorpStudy(ref_study).participant_payout_amount()`");

        for (uint256 i; i < amount_of_submitters; ) {
            submiter_proxies[i].claimReward(ref_study);
            vm.assertEq(participant_payout_amount_expected, address(submiter_proxies[i]).balance, "Unexpected: `address(submiter_proxies[i]).balance`");

            unchecked { ++i; }
        }

        vm.assertEq(0, ref_study.balance, "Unexpected: `ref_study.balance`");
        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__FINISHED(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    function test_write__claimReward__with_rational_fractional_submissions() public {
        IZorpStudy(ref_study).startStudy();

        uint256 amount_of_submitters = 9;
        ZorpStudy_SubmitterProxy[] memory submiter_proxies = new ZorpStudy_SubmitterProxy[](amount_of_submitters);
        for (uint256 i; i < amount_of_submitters; ) {
            ZorpStudy_SubmitterProxy submiter_proxy = new ZorpStudy_SubmitterProxy(ZORP_STUDY__PARTICIPANT);
            submiter_proxies[i] = submiter_proxy;

            submiter_proxy.submitData(ref_study, ZORP_STUDY__IPFS_CID);

            unchecked { ++i; }
        }

        uint256 owner_balance_before = ZORP_STUDY__OWNER.balance;
        IZorpStudy(ref_study).endStudy();
        uint256 owner_balance_after = ZORP_STUDY__OWNER.balance;

        vm.assertTrue(owner_balance_before < owner_balance_after, "Unexpected: `ZORP_STUDY__OWNER.balance`");

        uint256 submissions = IZorpStudy(ref_study).submissions();
        vm.assertEq(amount_of_submitters, submissions, "Unexpected: `IZorpStudy(ref_study).submissions()`");

        uint256 invalidated = IZorpStudy(ref_study).invalidated();
        vm.assertEq(0, invalidated, "Unexpected: `IZorpStudy(ref_study).invalidated()`");

        uint256 participant_payout_amount_expected = ref_study.balance / (submissions - invalidated);
        vm.assertEq(participant_payout_amount_expected, IZorpStudy(ref_study).participant_payout_amount(), "Unexpected: `IZorpStudy(ref_study).participant_payout_amount()`");

        for (uint256 i; i < amount_of_submitters; ) {
            submiter_proxies[i].claimReward(ref_study);
            vm.assertEq(participant_payout_amount_expected, address(submiter_proxies[i]).balance, "Unexpected: `address(submiter_proxies[i]).balance`");

            unchecked { ++i; }
        }

        vm.assertEq(0, ref_study.balance, "Unexpected: `ref_study.balance`");
        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__FINISHED(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    function test_write__flagInvalidSubmission() public {
        IZorpStudy(ref_study).startStudy();
        IZorpStudy(ref_study).submitData(ZORP_STUDY__IPFS_CID);

        uint256 index = IZorpStudy(ref_study).participant_index(ZORP_STUDY__PARTICIPANT);
        IZorpStudy(ref_study).flagInvalidSubmission(address(this));

        vm.assertEq(IZorpStudy(ref_study).PARTICIPANT_STATUS__INVALID(), IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT), "Unexpected: `IZorpStudy(ref_study).participant_status(ZORP_STUDY__PARTICIPANT)`");
        vm.assertEq(0, IZorpStudy(ref_study).participant_index(ZORP_STUDY__PARTICIPANT), "Unexpected: `IZorpStudy(ref_study).participant_index(ZORP_STUDY__PARTICIPANT)`");
        vm.assertEq(address(0), IZorpStudy(ref_study).index_participant(index), "Unexpected: `IZorpStudy(ref_study).index_participant(index)`");
        vm.assertEq("", IZorpStudy(ref_study).submitted_data(1), "Unexpected: `IZorpStudy(ref_study).submitted_data(1)`");
        vm.assertEq(1, IZorpStudy(ref_study).invalidated(), "Unexpected: `ZorpStudy.invalidated()`");

        vm.assertEq(1, IZorpStudy(ref_study).submissions(), "Unexpected: `ZorpStudy.submissions()`");
    }

    function test_write__startStudy() public {
        IZorpStudy(ref_study).startStudy();
        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__ACTIVE(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    function test_write__endStudy__with_zero_submissions() public {
        IZorpStudy(ref_study).startStudy();

        uint256 owner_balance_before = ZORP_STUDY__OWNER.balance;
        IZorpStudy(ref_study).endStudy();
        uint256 owner_balance_after = ZORP_STUDY__OWNER.balance;

        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__FINISHED(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
        vm.assertTrue(owner_balance_before < owner_balance_after, "Unexpected: `ZORP_STUDY__OWNER.balance`");
        vm.assertEq(0, ref_study.balance, "Unexpected: `ref_study.balance`");
    }

    function test_write__endStudy__with_terminating_fractional_submissions() public {
        IZorpStudy(ref_study).startStudy();

        uint256 amount_of_submitters = 10;
        ZorpStudy_SubmitterProxy[] memory submiter_proxies = new ZorpStudy_SubmitterProxy[](amount_of_submitters);
        for (uint256 i; i < amount_of_submitters; ) {
            ZorpStudy_SubmitterProxy submiter_proxy = new ZorpStudy_SubmitterProxy(ZORP_STUDY__PARTICIPANT);
            submiter_proxies[i] = submiter_proxy;

            submiter_proxy.submitData(ref_study, ZORP_STUDY__IPFS_CID);

            unchecked { ++i; }
        }

        IZorpStudy(ref_study).endStudy();

        uint256 submissions = IZorpStudy(ref_study).submissions();
        vm.assertEq(amount_of_submitters, submissions, "Unexpected: `IZorpStudy(ref_study).submissions()`");

        uint256 invalidated = IZorpStudy(ref_study).invalidated();
        vm.assertEq(0, invalidated, "Unexpected: `IZorpStudy(ref_study).invalidated()`");

        uint256 participant_payout_amount_expected = ref_study.balance / (submissions - invalidated);
        vm.assertEq(participant_payout_amount_expected, IZorpStudy(ref_study).participant_payout_amount(), "Unexpected: `IZorpStudy(ref_study).participant_payout_amount()`");

        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__FINISHED(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    function test_write__endStudy__with_rational_fractional_submissions() public {
        IZorpStudy(ref_study).startStudy();

        uint256 amount_of_submitters = 9;
        ZorpStudy_SubmitterProxy[] memory submiter_proxies = new ZorpStudy_SubmitterProxy[](amount_of_submitters);
        for (uint256 i; i < amount_of_submitters; ) {
            ZorpStudy_SubmitterProxy submiter_proxy = new ZorpStudy_SubmitterProxy(ZORP_STUDY__PARTICIPANT);
            submiter_proxies[i] = submiter_proxy;

            submiter_proxy.submitData(ref_study, ZORP_STUDY__IPFS_CID);

            unchecked { ++i; }
        }

        IZorpStudy(ref_study).endStudy();

        uint256 submissions = IZorpStudy(ref_study).submissions();
        vm.assertEq(amount_of_submitters, submissions, "Unexpected: `IZorpStudy(ref_study).submissions()`");

        uint256 invalidated = IZorpStudy(ref_study).invalidated();
        vm.assertEq(0, invalidated, "Unexpected: `IZorpStudy(ref_study).invalidated()`");

        uint256 participant_payout_amount_expected = ref_study.balance / (submissions - invalidated);
        vm.assertEq(participant_payout_amount_expected, IZorpStudy(ref_study).participant_payout_amount(), "Unexpected: `IZorpStudy(ref_study).participant_payout_amount()`");

        vm.assertEq(IZorpStudy(ref_study).STUDY_STATUS__FINISHED(), IZorpStudy(ref_study).study_status(), "Unexpected: `ZorpStudy.study_status()`");
    }

    receive() external payable {}
    fallback() external payable {}
}
