const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of Academic Credential Verification System...");

  // Get the contract factory
  const AcademicCredential = await ethers.getContractFactory("AcademicCredential");
  console.log("📋 Contract factory created");

  // Deploy the contract
  console.log("⛏️  Deploying contract...");
  const academicCredential = await AcademicCredential.deploy();
  
  // Wait for deployment to finish
  await academicCredential.waitForDeployment();
  
  const contractAddress = await academicCredential.getAddress();
  console.log("✅ AcademicCredential deployed to:", contractAddress);

  // Get deployment info
  const deployment = await academicCredential.deploymentTransaction();
  const gasUsed = deployment.gasLimit;
  
  console.log("📊 Deployment Details:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Gas Used:", gasUsed.toString());
  console.log("   Block Number:", deployment.blockNumber);

  // Verify the contract owner is set correctly
  const owner = await academicCredential.owner();
  console.log("👑 Contract Owner:", owner);

  // Verify the deployer is a university authority
  const deployer = (await ethers.getSigners())[0];
  const isAuthority = await academicCredential.isUniversityAuthority(deployer.address);
  console.log("🎓 Deployer is University Authority:", isAuthority);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("   1. Copy the contract address above");
  console.log("   2. Update the frontend configuration");
  console.log("   3. Start the frontend application");
  console.log("   4. Test the system with sample credentials");

  return {
    contractAddress,
    owner,
    deployer: deployer.address
  };
}

// Handle errors
main()
  .then((result) => {
    console.log("\n📋 Deployment Summary:");
    console.log("   Contract:", result.contractAddress);
    console.log("   Owner:", result.owner);
    console.log("   Deployer:", result.deployer);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
