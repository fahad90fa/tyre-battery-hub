require("@nomicfoundation/hardhat-toolbox");

/**
 * Hardhat configuration for the Reentrancy Attack Demo.
 *
 * The `localhost` network points at the node started by `npm run chain`
 * (i.e. `hardhat node`), which listens on 127.0.0.1:8545 with chainId 31337.
 * The React frontend talks to that same endpoint.
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
