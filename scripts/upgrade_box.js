// scripts/upgrade_box.js
const { ethers, upgrades } = require('hardhat');

async function main () {
  const NFTV2 = await ethers.getContractFactory('NFTV2');
  console.log('Upgrading NFT...');
  await upgrades.upgradeProxy('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', NFTV2);
  console.log('NFT upgraded');
}

main();
