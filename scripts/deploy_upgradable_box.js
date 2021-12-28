// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat');

async function main () {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  console.log('Deploying NFTMarket...');
  const nftMarket = await upgrades.deployProxy(NFTMarket, [0.025, 60 * 60 * 24], { initializer: 'store' });
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);
}

main();
