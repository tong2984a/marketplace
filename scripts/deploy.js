const hre = require("hardhat");
const fs = require('fs');
const allowance_config = require('../allowance_config.json')

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  const Chocho = await hre.ethers.getContractFactory("Chocho");
  const GOOD = await Chocho.deploy("Good Good", "GOOD", 18, "50000000000000000000000");
  await GOOD.deployed();
  console.log("GOOD deployed to:", GOOD.address);
  const BREW = await Chocho.deploy("Brew Bros Coffee", "BREW", 18, "5000000000000000000");
  await BREW.deployed();
  console.log("BREW deployed to:", BREW.address);
  const KHM = await Chocho.deploy("Khamsa Cafe", "KHM", 18, "50000000000000000000");
  await KHM.deployed();
  console.log("KHM deployed to:", KHM.address);
  const GVG = await Chocho.deploy("Green Veggie", "GVG", 18, "500000000000000000000");
  await GVG.deployed();
  console.log("GVG deployed to:", GVG.address);
  const GVGG = await Chocho.deploy("GAIA VEGGIE", "GVGG", 18, "500000000000000000000");
  await GVGG.deployed();
  console.log("GVGG deployed to:", GVGG.address);
  const LNC = await Chocho.deploy("LN COFFEE", "LNC", 18, "50000000000000000000");
  await LNC.deployed();
  console.log("LNC deployed to:", LNC.address);
  const OVO = await Chocho.deploy("OVO CAFE", "OVO", 18, "50000000000000000000");
  await OVO.deployed();
  console.log("OVO deployed to:", OVO.address);
  const BG = await Chocho.deploy("Barista by Givres", "BG", 18, "5000000000000000000");
  await BG.deployed();
  console.log("BG deployed to:", BG.address);

  let contract_owner = allowance_config[hre.network.name]['contract_owner']['address']

  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const network_name = "${hre.network.name}"
  export const contract_owner = "${contract_owner}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

  let chocho_config = `
  {
    "GOODaddress" : "${GOOD.address}",
    "BREWaddress" : "${BREW.address}",
    "KHMaddress" : "${KHM.address}",
    "GVGaddress" : "${GVG.address}",
    "GVGGaddress" : "${GVGG.address}",
    "LNCaddress" : "${LNC.address}",
    "OVOaddress" : "${OVO.address}",
    "BGaddress" : "${BG.address}"
  }
  `

  let chocho_data = JSON.stringify(chocho_config)
  fs.writeFileSync('chocho_config.json', JSON.parse(chocho_data))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
