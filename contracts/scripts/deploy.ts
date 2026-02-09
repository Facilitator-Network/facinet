import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying x402 Facilitator Reputation System (ERC-8004)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

  // Deploy Identity Registry
  console.log("1️⃣ Deploying FacilitatorIdentityRegistry (ERC-721)...");
  const IdentityRegistry = await ethers.getContractFactory("FacilitatorIdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ FacilitatorIdentityRegistry deployed to:", identityRegistryAddress);
  console.log("");

  // Deploy Reputation Registry
  console.log("2️⃣ Deploying FacilitatorReputationRegistry...");
  const ReputationRegistry = await ethers.getContractFactory("FacilitatorReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy(identityRegistryAddress);
  await reputationRegistry.waitForDeployment();
  const reputationRegistryAddress = await reputationRegistry.getAddress();
  console.log("✅ FacilitatorReputationRegistry deployed to:", reputationRegistryAddress);
  console.log("");

  // Print summary
  console.log("📋 Deployment Summary:");
  console.log("════════════════════════════════════════════════");
  console.log("Identity Registry:   ", identityRegistryAddress);
  console.log("Reputation Registry: ", reputationRegistryAddress);
  console.log("════════════════════════════════════════════════");
  console.log("");

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: "Avalanche Fuji Testnet",
    chainId: 43113,
    identityRegistry: identityRegistryAddress,
    reputationRegistry: reputationRegistryAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("💾 Addresses saved to deployed-addresses.json");

  // Print usage instructions
  console.log("");
  console.log("📖 Next Steps:");
  console.log("1. Update your backend .env with:");
  console.log(`   IDENTITY_REGISTRY_ADDRESS=${identityRegistryAddress}`);
  console.log(`   REPUTATION_REGISTRY_ADDRESS=${reputationRegistryAddress}`);
  console.log("");
  console.log("2. Verify contracts on SnowTrace:");
  console.log(`   npx hardhat verify --network fuji ${identityRegistryAddress}`);
  console.log(`   npx hardhat verify --network fuji ${reputationRegistryAddress} ${identityRegistryAddress}`);
  console.log("");
  console.log("3. View on SnowTrace:");
  console.log(`   https://testnet.snowtrace.io/address/${identityRegistryAddress}`);
  console.log(`   https://testnet.snowtrace.io/address/${reputationRegistryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
