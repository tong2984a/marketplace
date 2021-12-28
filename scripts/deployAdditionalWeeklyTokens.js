const hre = require("hardhat");
const fs = require('fs');

async function main() {
  let marketContractAddress = '0x7FBc7feD011c772D52a234735269A848495ae973'

  const Market = await hre.ethers.getContractFactory("NFTMarket")
  const market = await Market.attach(marketContractAddress)

  let listingPrice = await market.getListingPrice()
  listingPrice = listingPrice.toString()
  let auctionPriceNumber = 1
  const auctionPrice = ethers.utils.parseUnits(auctionPriceNumber.toString(), 'ether')

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(marketContractAddress);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  for (let i = 0; i < 10; i++) {
    let transaction = await nft.createToken("https://ipfs.infura.io/ipfs/QmUHuUuKPXQLgbRrkEceHAYNaH7HKxMbiraGMLVUh9MnoB")
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    console.log("nft createToken tokenId:", tokenId)
    transaction = await market.createMarketItem(nft.address, tokenId, auctionPrice, { value: listingPrice })
    tx = await transaction.wait()
    console.log("market createMarketItem:", tokenId)
  }

  let items = await market.fetchMarketItems()
  items = await Promise.all(items.map(async i => {
    const tokenUri = await nft.tokenURI(i.tokenId)
    //console.log("****i", i)
    let item = {
      price: i.price.toString(),
      tokenId: i.tokenId.toString(),
      seller: i.seller,
      owner: i.owner,
      address: i.nftContract,
      tokenUri
    }
    return item
  }))
  console.log('items: ', items.length)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
