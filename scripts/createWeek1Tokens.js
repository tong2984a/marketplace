const hre = require("hardhat");
const fs = require('fs');
const chocho_config = require('../chocho_config.json')
const allowance_config = require('../allowance_config.json')

async function main() {
  let marketContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  let nftContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    const Market = await hre.ethers.getContractFactory("NFTMarket")
    const market = await Market.attach(marketContractAddress)
    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()
    let auctionPriceNumber = 1
    const auctionPrice = ethers.utils.parseUnits(auctionPriceNumber.toString(), 'ether')

    const NFT = await hre.ethers.getContractFactory("NFT")
    const nft = await NFT.attach(nftContractAddress)
    for (let i = 0; i < 10; i++) {
      let transaction = await nft.createToken("https://gateway.pinata.cloud/ipfs/QmWvc3V9ixqckeKkQ4yjFLzessAbBvrJCQRtuNxyU2SoaH")
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
      let item = {
        itemId: i.itemId.toNumber(),
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)

    for (let i = 0; i < 10; i++) {
      await market.createAuction(nftContractAddress, items[i].itemId)
    }
/*
    biddingPrice = ethers.utils.parseUnits('1', 'ether')
    console.log('biddingPrice: ', parseInt(Number(ethers.utils.formatEther( biddingPrice ))))
    await market.createMarketSale(nftContractAddress, 1, { value: biddingPrice})
    biddingPrice = ethers.utils.parseUnits('2.1', 'ether')
    console.log('biddingPrice: ', parseInt(Number(ethers.utils.formatEther( biddingPrice ))))
    await market.createMarketSale(nftContractAddress, 2, { value: biddingPrice})
    biddingPrice = ethers.utils.parseUnits('1.2', 'ether')
    console.log('biddingPrice: ', parseInt(Number(ethers.utils.formatEther( biddingPrice ))))
    await market.createMarketSale(nftContractAddress, 3, { value: biddingPrice})
    biddingPrice = ethers.utils.parseUnits('1.3', 'ether')
    console.log('biddingPrice: ', parseInt(Number(ethers.utils.formatEther( biddingPrice ))))

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")
    await nft.createToken("https://www.mytokenlocation3.com")
    await nft.createToken("https://www.mytokenlocation4.com")
    await nft.createToken("https://www.mytokenlocation5.com")
    await nft.createToken("https://www.mytokenlocation6.com")
    await nft.createToken("https://www.mytokenlocation7.com")
    await nft.createToken("https://www.mytokenlocation8.com")
    await nft.createToken("https://www.mytokenlocation9.com")
    await nft.createToken("https://www.mytokenlocation10.com")

    await market.createMarketItem(nftContractAddress, 11, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 12, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 13, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 14, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 15, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 16, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 17, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 18, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 19, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 20, auctionPrice, { value: listingPrice })

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)

    await market.createMarketSale(nftContractAddress, 10, { value: auctionPrice})
    */
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
