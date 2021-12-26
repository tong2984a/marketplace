const hre = require("hardhat");
const fs = require('fs');
const chocho_config = require('../chocho_config.json')
const allowance_config = require('../allowance_config.json')

async function main() {
  let spender = allowance_config[hre.network.name]['spender']['address']
  let spender_approval = allowance_config[hre.network.name]['spender']['approve_amount']
  let approve_amount = ethers.utils.parseUnits(spender_approval, 'ether')

  const Chocho = await hre.ethers.getContractFactory("Chocho");
  for (var key in chocho_config) {
    let chocho = await Chocho.attach(chocho_config[key])
    await chocho.approve(spender, approve_amount)
    console.log(`*** ${spender} is approved ${spender_approval} ${key} at ${chocho_config[key]}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
