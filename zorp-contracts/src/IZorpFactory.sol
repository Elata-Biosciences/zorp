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
        function createStudy(address payable initialOwner, string memory encryptionKey) external payable returns (address);
    /* Public }}} */

    /* Owner {{{ */
        function withdraw(address payable to, uint256 amount) external payable;
    /* Owner }}} */

    /* Viewable {{{ */
        ///
        function paginateSubmittedData(address study, uint256 start, uint256 limit) external view returns (string[] memory);

        ///
        function paginateStudies(uint256 start, uint256 limit) external view returns (address[] memory);
    /* Viewable }}} */
}

interface IZorpFactory_Inherited is IOwnable {}

/// @title On/Off chain consumers of `ZorpStudy` may wish to use this interface
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
interface IZorpFactory is IZorpFactory_Storage, IZorpFactory_Functions, IZorpFactory_Inherited {}
