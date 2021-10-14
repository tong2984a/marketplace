import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from 'next/image'

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import Clock from './Clock'
import Modal from './components/Modal'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        auction: i.auction,
        endTime: i.endTime,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }
  async function buyNft(nft) {
    setShowModal(true)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    setShowModal(false)
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (
    <div>
      <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
      <p className="px-20 py-10">Please use Sell Digital Asset to upload your creative work</p>
    </div>
  )
  return (
    <div>
    <div className="p-4">
      <h1 className="text-2xl py-2">Public Home - where creative work are put on display for purchase.</h1>
    </div>
    <div className="flex justify-center">
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
      >
        <p>Please wait. Your METAMASK wallet will prompt you once for the purchase.</p>
        <p>We will move your purchase to your personal Collection page.</p>
      </Modal>
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden bg-black">
                <Image src={nft.image} width="325" height="475" alt="NFT on display" />
                <div className="p-4 bg-white">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                {nft.auction ? (
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                    <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>
                      Buy
                    </button>
                    <div className="text-white">
                      Auction ending in: <Clock endTime={Number(nft.endTime)} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">Off Market</p>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
    </div>
  )
}
