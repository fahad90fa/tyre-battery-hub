const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * These tests are the machine-checkable proof behind the UI demo:
 *   - the attack drains VulnerableBank,
 *   - the identical attack cannot touch SecureBank.
 *
 * Run with:  npm test
 */
describe("Reentrancy attack", function () {
  const VICTIM_DEPOSIT = ethers.parseEther("5"); // per victim
  const ATTACK_SEED = ethers.parseEther("1");

  async function fixture(bankName) {
    const [deployer, alice, bob, attackerEOA] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory(bankName);
    const bank = await Bank.deploy();
    await bank.waitForDeployment();

    // Two innocent victims deposit real Ether.
    await bank.connect(alice).deposit({ value: VICTIM_DEPOSIT });
    await bank.connect(bob).deposit({ value: VICTIM_DEPOSIT });

    const Attacker = await ethers.getContractFactory("Attacker");
    const attacker = await Attacker.connect(attackerEOA).deploy(await bank.getAddress());
    await attacker.waitForDeployment();

    return { bank, attacker, attackerEOA };
  }

  it("drains the VulnerableBank", async function () {
    const { bank, attacker } = await fixture("VulnerableBank");

    const before = await bank.totalBankBalance();
    expect(before).to.equal(ethers.parseEther("10")); // two 5-ETH victims

    await attacker.attack({ value: ATTACK_SEED });

    const bankAfter = await bank.totalBankBalance();
    const stolen = await attacker.stolenBalance();
    const reentries = await attacker.reentryCount();

    // Bank is emptied (or left with less than one drain unit).
    expect(bankAfter).to.be.lt(ATTACK_SEED);
    // Attacker walked away with the seed + everyone else's money.
    expect(stolen).to.equal(ethers.parseEther("11"));
    // The re-entrancy actually looped.
    expect(reentries).to.be.gt(0);
  });

  it("cannot drain the SecureBank (attack reverts)", async function () {
    const { bank, attacker } = await fixture("SecureBank");

    const before = await bank.totalBankBalance();
    expect(before).to.equal(ethers.parseEther("10"));

    await expect(attacker.attack({ value: ATTACK_SEED })).to.be.reverted;

    // Not a single wei moved.
    expect(await bank.totalBankBalance()).to.equal(before);
    expect(await attacker.stolenBalance()).to.equal(0n);
  });

  it("lets the attacker collect stolen funds to their wallet", async function () {
    const { bank, attacker, attackerEOA } = await fixture("VulnerableBank");
    await attacker.attack({ value: ATTACK_SEED });

    const walletBefore = await ethers.provider.getBalance(attackerEOA.address);
    const tx = await attacker.connect(attackerEOA).collect();
    const receipt = await tx.wait();
    const gas = receipt.gasUsed * receipt.gasPrice;
    const walletAfter = await ethers.provider.getBalance(attackerEOA.address);

    // Wallet grew by the stolen 11 ETH, minus gas for the collect() call.
    expect(walletAfter).to.equal(walletBefore + ethers.parseEther("11") - gas);
    expect(await attacker.stolenBalance()).to.equal(0n);
  });
});
