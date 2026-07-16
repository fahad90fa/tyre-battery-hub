/**
 * Optional CLI deploy script.
 *
 * The React dashboard deploys contracts straight from the browser, so you do
 * NOT need this to run the demo. It exists for two reasons:
 *   1. A sanity check that the contracts deploy against your local node.
 *   2. Seeding the chain with "victim" deposits so the attack has funds to
 *      drain even before you touch the UI.
 *
 * Usage (with `npm run chain` already running in another terminal):
 *   npm run deploy
 */
const hre = require("hardhat");

async function main() {
  const ethers = hre.ethers;
  const [deployer, alice, bob] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Vulnerable = await ethers.getContractFactory("VulnerableBank");
  const vulnerable = await Vulnerable.deploy();
  await vulnerable.waitForDeployment();
  console.log("VulnerableBank:", await vulnerable.getAddress());

  const Secure = await ethers.getContractFactory("SecureBank");
  const secure = await Secure.deploy();
  await secure.waitForDeployment();
  console.log("SecureBank:    ", await secure.getAddress());

  // Seed the vulnerable bank with innocent-bystander deposits.
  await (await vulnerable.connect(alice).deposit({ value: ethers.parseEther("5") })).wait();
  await (await vulnerable.connect(bob).deposit({ value: ethers.parseEther("5") })).wait();
  console.log("Seeded VulnerableBank with 10 ETH from two victims.");

  console.log(
    "\nVulnerableBank total balance:",
    ethers.formatEther(await vulnerable.totalBankBalance()),
    "ETH"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
