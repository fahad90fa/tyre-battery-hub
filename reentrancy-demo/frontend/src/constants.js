// Local chain + well-known Hardhat dev accounts.
//
// These private keys are printed by `npx hardhat node` on every startup and are
// identical across every Hardhat install on the planet. They are PUBLIC and
// worthless on any real network — used here only to drive a local demo.

export const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";

export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_CHAIN_ID_HEX = "0x7a69"; // 31337

// Account #0 — the "user" (deployer / attacker operator) in Local dev mode.
export const LOCAL_PRIVATE_KEY =
  import.meta.env.VITE_LOCAL_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Accounts #1 and #2 — innocent "victims" whose deposits get stolen.
export const VICTIM_KEYS = [
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // #1
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // #2
];

// Network params used to add/switch the Hardhat chain inside MetaMask.
export const HARDHAT_NETWORK = {
  chainId: HARDHAT_CHAIN_ID_HEX,
  chainName: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: [RPC_URL],
};

// Demo defaults (in ETH).
export const DEFAULT_VICTIM_DEPOSIT = "5";
export const DEFAULT_ATTACK_SEED = "1";

export const TARGET = {
  VULNERABLE: "vulnerable",
  SECURE: "secure",
};
