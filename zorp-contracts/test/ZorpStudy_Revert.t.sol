// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol";

import { ZorpStudy_SubmitterProxy } from "./ZorpStudy_Success.t.sol";

import { WithdrawFailed } from "../src/IZorpFactory.sol";

import { ZorpStudy } from "../src/ZorpStudy.sol";
import {
    IZorpStudy,
    InvalidIPFSCID,
    InvalidMessageValue,
    InvalidParticipantState,
    InvalidStudyState,
    ParticipantPayoutFailed,
    RemainderTransferFailed
} from "../src/IZorpStudy.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZorpStudy_Attacker is Ownable, ReentrancyGuard {
    constructor(address initialOwner_) Ownable(initialOwner_) {}

    function withdraw(address payable to, uint256 amount) external payable nonReentrant onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert WithdrawFailed(to, amount, address(this).balance);
        }
    }

    function submitData(address ref_study, string memory ipfs_cid) external payable onlyOwner {
        IZorpStudy(ref_study).submitData(ipfs_cid);
    }

    function claimReward(address ref_study) external payable onlyOwner {
        IZorpStudy(ref_study).claimReward();
    }

    function endStudy(address ref_study) external payable onlyOwner {
        IZorpStudy(ref_study).endStudy();
    }

    function transferOwnershipOf(address ref_study, address newOwner) external payable onlyOwner {
        IZorpStudy(ref_study).transferOwnership(newOwner);
    }

    // receive() external payable {}
    fallback() external payable virtual {
        if (msg.sender.balance > 0) {
            IZorpStudy(msg.sender).claimReward();
        }
    }
}

contract ZorpStudy_BadOwner is ZorpStudy_Attacker {
    constructor(address initialOwner_) ZorpStudy_Attacker(initialOwner_) {}

    error NotPayble();

    fallback() external payable override {
        revert NotPayble();
    }
}

contract ZorpStudy_Revert_Write_Test is Test {
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

        uint256 amount = 1 ether;
        // Deploy a fresh study for each test
        ref_study = address(new ZorpStudy{ value: amount }(ZORP_STUDY__OWNER, ZORP_STUDY__IPFS_CID));
    }

    function test_write__constructor__rejects_when_msg_value_is_too_low() public {
        uint256 amount = 0;

        vm.expectRevert(abi.encodeWithSelector(InvalidMessageValue.selector, amount, 1), ref_study);
        new ZorpStudy{ value: amount }(ZORP_STUDY__OWNER, ZORP_STUDY__IPFS_CID);
    }

    function test_write__submitData__rejects_study_is_not_active() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidStudyState.selector,
                IZorpStudy(ref_study).study_status(),
                IZorpStudy(ref_study).STUDY_STATUS__ACTIVE()
            ),
            ref_study
        );
        IZorpStudy(ref_study).submitData(ZORP_STUDY__IPFS_CID);
    }

    function test_write__submitData__rejects_invalid_ipfs_cid() public {
        IZorpStudy(ref_study).startStudy();

        vm.expectRevert(abi.encodeWithSelector(InvalidIPFSCID.selector), ref_study);
        IZorpStudy(ref_study).submitData("");
    }

    function test_write__submitData__rejects_invalid_submitters() public {
        IZorpStudy(ref_study).startStudy();
        IZorpStudy(ref_study).submitData(ZORP_STUDY__IPFS_CID);

        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidParticipantState.selector,
                IZorpStudy(ref_study).participant_status(address(this)),
                IZorpStudy(ref_study).PARTICIPANT_STATUS__NA()
            ),
            ref_study
        );
        IZorpStudy(ref_study).submitData(ZORP_STUDY__IPFS_CID);
    }

    function test_write__claimReward__rejects_study_is_not_finished() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidStudyState.selector,
                IZorpStudy(ref_study).study_status(),
                IZorpStudy(ref_study).STUDY_STATUS__FINISHED()
            ),
            ref_study
        );
        IZorpStudy(ref_study).claimReward();
    }

    function test_write__claimReward__rejects_invalid_claimant() public {
        IZorpStudy(ref_study).startStudy();
        IZorpStudy(ref_study).endStudy();

        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidParticipantState.selector,
                IZorpStudy(ref_study).participant_status(address(this)),
                IZorpStudy(ref_study).PARTICIPANT_STATUS__SUBMITTED()
            ),
            ref_study
        );
        IZorpStudy(ref_study).claimReward();
    }

    function test_write__claimReward__rejects_reentry() public {
        ZorpStudy_Attacker study_attacker = new ZorpStudy_Attacker(ZORP_STUDY__OWNER);
        ZorpStudy_SubmitterProxy submiter_proxy = new ZorpStudy_SubmitterProxy(ZORP_STUDY__PARTICIPANT);

        IZorpStudy(ref_study).startStudy();

        study_attacker.submitData(ref_study, ZORP_STUDY__IPFS_CID);
        submiter_proxy.submitData(ref_study, ZORP_STUDY__IPFS_CID);

        IZorpStudy(ref_study).endStudy();

        uint256 balance_attacker_before = address(study_attacker).balance;
        uint256 balance_owner_before = ZORP_STUDY__OWNER.balance;
        uint256 balance_study_before = ref_study.balance;

        vm.expectRevert(
            abi.encodeWithSelector(
                ParticipantPayoutFailed.selector,
                address(study_attacker),
                IZorpStudy(ref_study).participant_payout_amount(),
                ref_study.balance
            ),
            ref_study
        );
        study_attacker.claimReward(ref_study);

        vm.assertEq(balance_attacker_before, address(study_attacker).balance, "Unexpected: change of `address(study_attacker).balance`");
        vm.assertEq(balance_owner_before, ZORP_STUDY__OWNER.balance, "Unexpected: change of `ZORP_STUDY__OWNER.balance`");
        vm.assertEq(balance_study_before, ref_study.balance, "Unexpected: change of `ref_study.balance`");
    }

    function test_write__flagInvalidSubmission__rejects_invalid_study_status() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidStudyState.selector,
                IZorpStudy(ref_study).study_status(),
                IZorpStudy(ref_study).STUDY_STATUS__ACTIVE()
            ),
            ref_study
        );
        IZorpStudy(ref_study).flagInvalidSubmission(ZORP_STUDY__OWNER);
    }

    function test_write__flagInvalidSubmission__rejects_invalid_participant_status() public {
        IZorpStudy(ref_study).startStudy();

        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidParticipantState.selector,
                IZorpStudy(ref_study).participant_status(ZORP_STUDY__OWNER),
                IZorpStudy(ref_study).PARTICIPANT_STATUS__SUBMITTED()
            ),
            ref_study
        );
        IZorpStudy(ref_study).flagInvalidSubmission(ZORP_STUDY__OWNER);
    }

    function test_write__startStudy__rejects_invalid_study_status() public {
        IZorpStudy(ref_study).startStudy();

        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidStudyState.selector,
                IZorpStudy(ref_study).study_status(),
                IZorpStudy(ref_study).STUDY_STATUS__NA()
            ),
            ref_study
        );
        IZorpStudy(ref_study).startStudy();
    }

    function test_write__endStudy__rejects_invalid_study_status() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidStudyState.selector,
                IZorpStudy(ref_study).study_status(),
                IZorpStudy(ref_study).STUDY_STATUS__ACTIVE()
            ),
            ref_study
        );
        IZorpStudy(ref_study).endStudy();
    }

    function test_write__endStudy__rejects_reentry_when_transfering_remainder_to_owner() public {
        IZorpStudy(ref_study).startStudy();

        uint256 amount_of_submitters = 10;
        ZorpStudy_SubmitterProxy[] memory submiter_proxies = new ZorpStudy_SubmitterProxy[](amount_of_submitters);
        for (uint256 i; i < amount_of_submitters; ) {
            ZorpStudy_SubmitterProxy submiter_proxy = new ZorpStudy_SubmitterProxy(ZORP_STUDY__PARTICIPANT);
            submiter_proxies[i] = submiter_proxy;

            submiter_proxy.submitData(ref_study, ZORP_STUDY__IPFS_CID);

            unchecked { ++i; }
        }

        ZorpStudy_Attacker study_attacker = new ZorpStudy_Attacker(ZORP_STUDY__OWNER);
        study_attacker.submitData(ref_study, ZORP_STUDY__IPFS_CID);

        IZorpStudy(ref_study).transferOwnership(address(study_attacker));

        uint256 balance_attacker_before = address(study_attacker).balance;
        uint256 balance_owner_before = ZORP_STUDY__OWNER.balance;
        uint256 balance_study_before = ref_study.balance;

        uint256 valid_submissions = IZorpStudy(ref_study).submissions() - IZorpStudy(ref_study).invalidated();
        uint256 participant_payout_amount = balance_study_before / valid_submissions;
        uint256 remainder = balance_study_before - (participant_payout_amount * valid_submissions);

        vm.expectRevert(
            abi.encodeWithSelector(
                RemainderTransferFailed.selector,
                address(study_attacker),
                remainder,
                balance_study_before
            ),
            ref_study
        );
        study_attacker.endStudy(ref_study);

        vm.assertEq(balance_attacker_before, address(study_attacker).balance, "Unexpected: change of `address(study_attacker).balance`");
        vm.assertEq(balance_owner_before, ZORP_STUDY__OWNER.balance, "Unexpected: change of `ZORP_STUDY__OWNER.balance`");
        vm.assertEq(balance_study_before, ref_study.balance, "Unexpected: change of `ref_study.balance`");
    }

    function test_write__endStudy__rejects_reentry_when_transfering_balance_to_owner() public {
        IZorpStudy(ref_study).startStudy();

        ZorpStudy_BadOwner bad_owner = new ZorpStudy_BadOwner(ZORP_STUDY__OWNER);

        IZorpStudy(ref_study).transferOwnership(address(bad_owner));

        uint256 balance_attacker_before = address(bad_owner).balance;
        uint256 balance_owner_before = ZORP_STUDY__OWNER.balance;
        uint256 balance_study_before = ref_study.balance;

        uint256 valid_submissions = IZorpStudy(ref_study).submissions() - IZorpStudy(ref_study).invalidated();
        uint256 participant_payout_amount;
        if (valid_submissions > 0) {
            participant_payout_amount = balance_study_before / valid_submissions;
        } else {
            participant_payout_amount = balance_study_before;
        }
        uint256 remainder = balance_study_before - (participant_payout_amount * valid_submissions);

        vm.expectRevert(
            abi.encodeWithSelector(
                RemainderTransferFailed.selector,
                address(bad_owner),
                remainder,
                balance_study_before
            ),
            address(bad_owner)
        );
        bad_owner.endStudy(ref_study);

        vm.assertEq(balance_attacker_before, address(bad_owner).balance, "Unexpected: change of `address(bad_owner).balance`");
        vm.assertEq(balance_owner_before, ZORP_STUDY__OWNER.balance, "Unexpected: change of `ZORP_STUDY__OWNER.balance`");
        vm.assertEq(balance_study_before, ref_study.balance, "Unexpected: change of `ref_study.balance`");
    }

    receive() external payable {}
    fallback() external payable {}
}
