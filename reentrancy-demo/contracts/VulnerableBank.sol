// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title VulnerableBank
 * @notice A deliberately insecure Ether vault used ONLY for education.
 *
 * The bug lives in {withdraw}: it sends Ether to the caller BEFORE it updates
 * the caller's balance. This violates the Checks-Effects-Interactions pattern
 * and opens a reentrancy window — while the external `call` is running, the
 * caller can re-enter {withdraw} and drain the contract before its balance is
 * ever zeroed out.
 *
 * DO NOT deploy anything resembling this contract to a real network.
 */
contract VulnerableBank {
    mapping(address => uint256) public balances;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    /// @notice Deposit Ether into your account.
    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw your entire balance.
     * @dev VULNERABLE: the external call happens before the state update.
     *      A malicious contract's `receive()` can call back into `withdraw`
     *      while `balances[msg.sender]` still shows the original amount.
     */
    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Nothing to withdraw");

        // ---- INTERACTION (happens too early) ----
        (bool ok, ) = msg.sender.call{value: bal}("");
        require(ok, "Ether transfer failed");

        // ---- EFFECT (happens too late) ----
        balances[msg.sender] = 0;

        emit Withdraw(msg.sender, bal);
    }

    /// @notice Balance of the caller.
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    /// @notice Total Ether currently held by the bank.
    function totalBankBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
