// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @dev see `Ownable` by OpenZeppelin
/// @custom:file lib/openzeppelin-contracts/contracts/access/Ownable.sol
interface IOwnable {
    /* Public {{{ */
        /// @dev See `Ownable.owner()` and `Ownable._owner`
        function owner() external view returns (address);
    /* Public }}} */

    /* Owner {{{ */
        /// @dev See `Ownable.renounceOwnership()` and `Ownable._transferOwnership`
        function renounceOwnership() external;

        /// @dev See `Ownable.transferOwnership()` and `Ownable._transferOwnership`
        function transferOwnership(address newOwner) external;
    /* Owner }}} */
}
