// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title SecureBank
 * @notice The hardened version of {VulnerableBank}. Same public interface, so
 *         the frontend and the Attacker contract can target either one — but
 *         this version cannot be drained.
 *
 * Two independent defenses are applied, either of which stops the attack:
 *   1. Checks-Effects-Interactions — the balance is zeroed BEFORE any Ether
 *      leaves the contract, so a re-entrant `withdraw` sees a zero balance.
 *   2. A `nonReentrant` mutex — a second entry into `withdraw` within the same
 *      call stack reverts immediately.
 *
 * Belt and suspenders is intentional: it mirrors how OpenZeppelin's
 * ReentrancyGuard is layered on top of good ordering in production code.
 */
contract SecureBank {
    mapping(address => uint256) public balances;

    // Reentrancy mutex: 1 = unlocked, 2 = locked. Non-zero values are used so
    // the storage slot never returns to zero, keeping gas costs predictable.
    uint256 private _status = 1;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    modifier nonReentrant() {
        require(_status == 1, "ReentrancyGuard: reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    /// @notice Deposit Ether into your account.
    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw your entire balance — safely.
     * @dev SECURE: effect precedes interaction, and the mutex blocks re-entry.
     */
    function withdraw() external nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Nothing to withdraw");

        // ---- EFFECT (happens first) ----
        balances[msg.sender] = 0;

        // ---- INTERACTION (happens last) ----
        (bool ok, ) = msg.sender.call{value: bal}("");
        require(ok, "Ether transfer failed");

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
