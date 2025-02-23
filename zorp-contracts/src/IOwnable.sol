// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @dev See `Ownable` by OpenZeppelin
interface IOwnable {
    /* Public {{{ */
        function owner() external view returns (address);
    /* Public }}} */

    /* Owner {{{ */
        function renounceOwnership() external;
        function transferOwnership(address newOwner) external;
    /* Owner }}} */
}
