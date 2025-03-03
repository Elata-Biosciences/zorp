// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IOwnable } from "./IOwnable.sol";

/// @title Publicly accessible stored states within `ZorpFactory`
interface IZorpFactory_Storage {
    /* Constants {{{ */
        function VERSION() external view returns (uint256);
    /* Constants }}} */

    /* Immutable {{{ */
    /* Immutable }}} */

    /* Mutable {{{ */
        function latest_study_index() external view returns (uint256);
        function studies(uint256) external view returns (address);
    /* Mutable }}} */
}

/// @title Executable logic for `ZorpFactory`
interface IZorpFactory_Functions {
    /* Public {{{ */
        /// @notice Deploy a new `ZorpStudy` contract and return its address
        /// @param initialOwner Address of owner for study, I.E. the account allowed to execute functions like; `.flagInvalidSubmission(address)`, `.startStudy()`, and `.endStudy()`
        /// @param encryptionKey pointer to public GPG/PGP key
        /// @return Address of new `ZorpStudy` contract
        ///
        /// @dev see `./IZorpStudy.sol`
        /// @dev see `./ZorpStudy.sol` → `constructor`
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// import { IZorpFactory } from "<NAME_SPACE>/src/IZorpFactory.sol";
        ///
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        ///
        /// address payable initialOwner = "<YOUR_PUBLIC_WALLET_ADDRESS>";
        /// string memory encryptionKey = "<CID_TO_YOUR_PUBLIC_PGP_KEY>";
        ///
        /// address newStudy = IZorpFactory(factory).createStudy{value: 1 ether}(initialOwner, encryptionKey);
        /// /* ... Make use of `IZorpStudy(newStudy)` features ... */
        /// ```
        ///
        /// @custom:throws "ZorpStudy: Invalid message value"
        function createStudy(address payable initialOwner, string memory encryptionKey) external payable returns (address);
    /* Public }}} */

    /* Owner {{{ */
        /// @notice Restricted to `IZorpFactory.owner()`
        /// @param to Address that should be paid from this contract with the native currency used by Blockchain
        /// @param amount Native currency for Blockchain to transfer from this contract to recipient
        ///
        /// ## On-chain example
        ///
        /// ```solidity
        /// address factory = <ADDRESS_OF_ZORP_FACTORY>;
        ///
        /// address payable to = <ADDRESS_TO_PAY>;
        /// uint256 amount = 1 ether;
        ///
        /// IZorpFactory(factory).withdraw(to, amount);
        /// ```
        ///
        /// @custom:throws "ZorpFactory: Failed withdraw"
        function withdraw(address payable to, uint256 amount) external payable;
    /* Owner }}} */

    /* Viewable {{{ */
        ///
        function paginateSubmittedData(address study, uint256 start, uint256 limit) external view returns (string[] memory);

        ///
        function paginateStudies(uint256 start, uint256 limit) external view returns (address[] memory);
    /* Viewable }}} */
}

/// @title Organize any inherited contracts that also contain publicly accessible functions/storage
interface IZorpFactory_Inherited is IOwnable {}

/// @title On/Off chain consumers of `ZorpStudy` may wish to use this interface
/// @author wkyleg
/// @author S0AndS0
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
///
/// ## On-chain example
///
/// ```solidity
/// import { IZorpFactory } from "<NAME_SPACE>/src/IZorpFactory.sol";
///
/// contract View_ZorpFactory {
///     getStudy(
///         address factory,
///         uint256 index
///     ) external view returns (address) {
///         return IZorpFactory(factory).studies(participant);
///     }
/// }
/// ```
///
/// @custom:file ./ZorpFactory.sol
/// @custom:link https://elata.bio/
/// @custom:link https://github.com/Elata-Biosciences/zorp
interface IZorpFactory is IZorpFactory_Storage, IZorpFactory_Functions, IZorpFactory_Inherited {}
