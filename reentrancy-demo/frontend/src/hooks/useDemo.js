import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import CONTRACTS from "../contracts";
import {
  RPC_URL,
  LOCAL_PRIVATE_KEY,
  VICTIM_KEYS,
  HARDHAT_CHAIN_ID_HEX,
  HARDHAT_NETWORK,
  TARGET,
} from "../constants";

let logSeq = 0;

const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");
const cleanError = (e) =>
  e?.info?.error?.message || e?.shortMessage || e?.reason || e?.message || String(e);

/**
 * useDemo — the single source of truth for the whole dashboard.
 *
 * It keeps the live ethers objects (providers, signer, addresses) in a ref so
 * async callbacks never read stale values, and mirrors everything the UI needs
 * into React state.
 */
export function useDemo() {
  const ref = useRef({
    readProvider: null,
    browserProvider: null,
    signer: null,
    account: null,
    addresses: { vulnerable: null, secure: null, attacker: null },
  });

  const [mode, setMode] = useState(null); // 'metamask' | 'local' | null
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [addresses, setAddressesState] = useState({
    vulnerable: null,
    secure: null,
    attacker: null,
  });
  const [target, setTarget] = useState(TARGET.VULNERABLE);
  const [logs, setLogs] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  const [stats, setStats] = useState({
    reentryCount: 0,
    drained: "0",
    stolen: "0",
    lastAttack: null, // 'success' | 'reverted' | null
  });
  const [balances, setBalances] = useState({
    vulnerable: "0",
    secure: "0",
    attacker: "0",
    account: "0",
    victims: [],
  });
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const log = useCallback((text, kind = "info") => {
    setLogs((prev) =>
      [
        { id: ++logSeq, time: new Date().toLocaleTimeString(), text, kind },
        ...prev,
      ].slice(0, 250)
    );
  }, []);

  const recordTx = useCallback((entry) => {
    setTxHistory((prev) =>
      [{ id: ++logSeq, time: new Date().toLocaleTimeString(), ...entry }, ...prev].slice(0, 100)
    );
  }, []);

  const setAddresses = useCallback((next) => {
    ref.current.addresses = next;
    setAddressesState(next);
  }, []);

  // ---- balances -----------------------------------------------------------
  const refreshBalances = useCallback(async () => {
    const rp = ref.current.readProvider;
    if (!rp) return;
    const { vulnerable, secure, attacker } = ref.current.addresses;
    const acct = ref.current.account;
    const out = { vulnerable: "0", secure: "0", attacker: "0", account: "0", victims: [] };
    try {
      if (vulnerable) out.vulnerable = ethers.formatEther(await rp.getBalance(vulnerable));
      if (secure) out.secure = ethers.formatEther(await rp.getBalance(secure));
      if (attacker) out.attacker = ethers.formatEther(await rp.getBalance(attacker));
      if (acct) out.account = ethers.formatEther(await rp.getBalance(acct));
      for (const key of VICTIM_KEYS) {
        const w = new ethers.Wallet(key, rp);
        out.victims.push({
          address: w.address,
          balance: ethers.formatEther(await rp.getBalance(w.address)),
        });
      }
      setBalances(out);
    } catch {
      /* node may be momentarily unavailable; ignore transient read errors */
    }
  }, []);

  // ---- connection ---------------------------------------------------------
  const connectLocal = useCallback(async () => {
    setError(null);
    setBusy("connect");
    try {
      // cacheTimeout: -1 disables ethers' 250ms getBalance/call cache so the
      // dashboard always shows fresh balances (critical right after an attack).
      const readProvider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
        cacheTimeout: -1,
      });
      const network = await readProvider.getNetwork();
      const signer = new ethers.Wallet(LOCAL_PRIVATE_KEY, readProvider);
      const addr = await signer.getAddress();
      ref.current.readProvider = readProvider;
      ref.current.signer = signer;
      ref.current.account = addr;
      setMode("local");
      setAccount(addr);
      setChainId(Number(network.chainId));
      log(`Connected local dev wallet ${short(addr)} (chain ${network.chainId})`, "success");
      await refreshBalances();
    } catch (e) {
      setError(
        `Could not reach the Hardhat node at ${RPC_URL}. Did you run "npm run chain"? (${cleanError(e)})`
      );
    } finally {
      setBusy(null);
    }
  }, [log, refreshBalances]);

  const connectMetaMask = useCallback(async () => {
    setError(null);
    setBusy("connect");
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not found. Install it or use the Local dev wallet.");
      }
      // Make sure MetaMask is pointed at the Hardhat network.
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [HARDHAT_NETWORK],
          });
        }
      }
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const addr = await signer.getAddress();
      const network = await browserProvider.getNetwork();

      ref.current.browserProvider = browserProvider;
      ref.current.signer = signer;
      ref.current.account = addr;
      // Reads still go through a direct RPC provider for consistency + seeding.
      ref.current.readProvider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
        cacheTimeout: -1,
      });

      setMode("metamask");
      setAccount(addr);
      setChainId(Number(network.chainId));
      log(`Connected MetaMask ${short(addr)} (chain ${network.chainId})`, "success");
      await refreshBalances();
    } catch (e) {
      setError(cleanError(e));
    } finally {
      setBusy(null);
    }
  }, [log, refreshBalances]);

  // ---- helpers ------------------------------------------------------------
  const bankMeta = (t) =>
    t === TARGET.VULNERABLE
      ? { name: "VulnerableBank", key: "vulnerable" }
      : { name: "SecureBank", key: "secure" };

  const bankContract = (t, runner) => {
    const { name, key } = bankMeta(t);
    const addr = ref.current.addresses[key];
    if (!addr) throw new Error("Deploy the contracts first.");
    return new ethers.Contract(addr, CONTRACTS[name].abi, runner);
  };

  // ---- deploy -------------------------------------------------------------
  const deployBanks = useCallback(async () => {
    setError(null);
    setBusy("deploy");
    try {
      const signer = ref.current.signer;
      const vf = new ethers.ContractFactory(
        CONTRACTS.VulnerableBank.abi,
        CONTRACTS.VulnerableBank.bytecode,
        signer
      );
      const v = await vf.deploy();
      await v.waitForDeployment();
      const vAddr = await v.getAddress();
      log(`VulnerableBank deployed → ${vAddr}`, "deploy");
      recordTx({ action: "Deploy VulnerableBank", detail: vAddr, status: "ok" });

      const sf = new ethers.ContractFactory(
        CONTRACTS.SecureBank.abi,
        CONTRACTS.SecureBank.bytecode,
        signer
      );
      const s = await sf.deploy();
      await s.waitForDeployment();
      const sAddr = await s.getAddress();
      log(`SecureBank deployed → ${sAddr}`, "deploy");
      recordTx({ action: "Deploy SecureBank", detail: sAddr, status: "ok" });

      setAddresses({ vulnerable: vAddr, secure: sAddr, attacker: null });
      setStats({ reentryCount: 0, drained: "0", stolen: "0", lastAttack: null });
      await refreshBalances();
    } catch (e) {
      setError(cleanError(e));
      log(`Deploy failed: ${cleanError(e)}`, "error");
    } finally {
      setBusy(null);
    }
  }, [log, recordTx, refreshBalances, setAddresses]);

  // ---- seed victims -------------------------------------------------------
  const seedVictims = useCallback(
    async (amountEth) => {
      setError(null);
      setBusy("seed");
      try {
        const rp = ref.current.readProvider;
        const value = ethers.parseEther(String(amountEth));
        for (const key of VICTIM_KEYS) {
          const victim = new ethers.Wallet(key, rp);
          for (const t of [TARGET.VULNERABLE, TARGET.SECURE]) {
            const c = bankContract(t, victim);
            await (await c.deposit({ value })).wait();
          }
          log(`Victim ${short(victim.address)} deposited ${amountEth} ETH into each bank`, "victim");
          recordTx({
            action: "Victim deposit",
            detail: `${short(victim.address)} · ${amountEth} ETH ×2`,
            status: "ok",
          });
        }
        await refreshBalances();
      } catch (e) {
        setError(cleanError(e));
        log(`Seeding failed: ${cleanError(e)}`, "error");
      } finally {
        setBusy(null);
      }
    },
    [log, recordTx, refreshBalances]
  );

  // ---- user deposit / withdraw (legit) ------------------------------------
  const deposit = useCallback(
    async (amountEth) => {
      setError(null);
      setBusy("deposit");
      try {
        const c = bankContract(target, ref.current.signer);
        const value = ethers.parseEther(String(amountEth));
        await (await c.deposit({ value })).wait();
        log(`You deposited ${amountEth} ETH into the ${target} bank`, "deposit");
        recordTx({ action: `Deposit (${target})`, detail: `${amountEth} ETH`, status: "ok" });
        await refreshBalances();
      } catch (e) {
        setError(cleanError(e));
        log(`Deposit failed: ${cleanError(e)}`, "error");
      } finally {
        setBusy(null);
      }
    },
    [target, log, recordTx, refreshBalances]
  );

  const withdraw = useCallback(async () => {
    setError(null);
    setBusy("withdraw");
    try {
      const c = bankContract(target, ref.current.signer);
      await (await c.withdraw()).wait();
      log(`You withdrew your balance from the ${target} bank`, "withdraw");
      recordTx({ action: `Withdraw (${target})`, detail: "full balance", status: "ok" });
      await refreshBalances();
    } catch (e) {
      setError(cleanError(e));
      log(`Withdraw failed: ${cleanError(e)}`, "error");
    } finally {
      setBusy(null);
    }
  }, [target, log, recordTx, refreshBalances]);

  // ---- the attack ---------------------------------------------------------
  const attack = useCallback(
    async (seedEth) => {
      setError(null);
      setBusy("attack");
      try {
        const signer = ref.current.signer;
        const { key } = bankMeta(target);
        const targetAddr = ref.current.addresses[key];
        if (!targetAddr) throw new Error("Deploy the contracts first.");

        // 1. Deploy a fresh attacker pointed at the currently selected bank.
        const af = new ethers.ContractFactory(
          CONTRACTS.Attacker.abi,
          CONTRACTS.Attacker.bytecode,
          signer
        );
        const attacker = await af.deploy(targetAddr);
        await attacker.waitForDeployment();
        const attackerAddr = await attacker.getAddress();
        setAddresses({ ...ref.current.addresses, attacker: attackerAddr });
        log(`Attacker deployed → ${attackerAddr}, targeting the ${target} bank`, "attack");
        recordTx({ action: "Deploy Attacker", detail: attackerAddr, status: "ok" });

        const rp = ref.current.readProvider;
        const bankBefore = await rp.getBalance(targetAddr);
        const seed = ethers.parseEther(String(seedEth));
        log(`Launching attack with ${seedEth} ETH seed…`, "attack");

        // 2. Fire. Against the secure bank this whole call reverts.
        const tx = await attacker.attack({ value: seed });
        const receipt = await tx.wait();

        // 3. Replay the Reentered events to narrate the drain live.
        let reentries = 0;
        for (const lg of receipt.logs) {
          try {
            const parsed = attacker.interface.parseLog(lg);
            if (parsed?.name === "Reentered") {
              reentries += 1;
              log(
                `  ↳ re-entry #${parsed.args.depth} — bank still holds ${ethers.formatEther(
                  parsed.args.bankBalanceRemaining
                )} ETH`,
                "reenter"
              );
            }
          } catch {
            /* not an attacker event (bank Deposit/Withdraw) — skip */
          }
        }

        const bankAfter = await rp.getBalance(targetAddr);
        const drained = bankBefore - bankAfter;
        const stolen = await attacker.stolenBalance();
        const onChainReentries = Number(await attacker.reentryCount());

        setStats({
          reentryCount: onChainReentries,
          drained: ethers.formatEther(drained),
          stolen: ethers.formatEther(stolen),
          lastAttack: "success",
        });
        log(
          `Attack SUCCEEDED — drained ${ethers.formatEther(drained)} ETH in ${
            onChainReentries
          } recursive calls`,
          "success"
        );
        recordTx({
          action: "Reentrancy attack",
          detail: `drained ${ethers.formatEther(drained)} ETH`,
          status: "ok",
        });
        await refreshBalances();
      } catch (e) {
        setStats((s) => ({ ...s, lastAttack: "reverted" }));
        log(
          `Attack BLOCKED — the ${target} bank reverted the reentrancy (${cleanError(e)})`,
          "blocked"
        );
        recordTx({ action: "Reentrancy attack", detail: cleanError(e), status: "revert" });
        await refreshBalances();
      } finally {
        setBusy(null);
      }
    },
    [target, log, recordTx, refreshBalances, setAddresses]
  );

  // ---- collect loot -------------------------------------------------------
  const collect = useCallback(async () => {
    setError(null);
    setBusy("collect");
    try {
      const addr = ref.current.addresses.attacker;
      if (!addr) throw new Error("No attacker contract deployed yet.");
      const attacker = new ethers.Contract(addr, CONTRACTS.Attacker.abi, ref.current.signer);
      await (await attacker.collect()).wait();
      log("Attacker swept the stolen Ether to their wallet", "attack");
      recordTx({ action: "Collect loot", detail: "→ attacker wallet", status: "ok" });
      await refreshBalances();
    } catch (e) {
      setError(cleanError(e));
      log(`Collect failed: ${cleanError(e)}`, "error");
    } finally {
      setBusy(null);
    }
  }, [log, recordTx, refreshBalances]);

  // ---- reset --------------------------------------------------------------
  const reset = useCallback(() => {
    setAddresses({ vulnerable: null, secure: null, attacker: null });
    setStats({ reentryCount: 0, drained: "0", stolen: "0", lastAttack: null });
    setLogs([]);
    setTxHistory([]);
    setBalances({ vulnerable: "0", secure: "0", attacker: "0", account: "0", victims: [] });
    log("Demo reset — deploy fresh contracts to start again", "info");
  }, [log, setAddresses]);

  // ---- live balance polling ----------------------------------------------
  useEffect(() => {
    if (!mode) return undefined;
    const id = setInterval(refreshBalances, 4000);
    return () => clearInterval(id);
  }, [mode, refreshBalances]);

  return {
    // state
    mode,
    account,
    chainId,
    addresses,
    target,
    logs,
    txHistory,
    stats,
    balances,
    busy,
    error,
    // actions
    connectLocal,
    connectMetaMask,
    setTarget,
    deployBanks,
    seedVictims,
    deposit,
    withdraw,
    attack,
    collect,
    reset,
    refreshBalances,
  };
}
