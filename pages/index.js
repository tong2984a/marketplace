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

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [showModal, setShowModal] = useState(false);

  if (loadingState === 'loaded' && !nfts.length) return (
    <div>
      <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
      <p className="px-20 py-10">Please use Sell Digital Asset to upload your creative work</p>
    </div>
  )
  return (
    <div className="container my-4">
      <div className="card card-image"
        style={{backgroundImage: "url('/gradient1.jpeg')"}}>
        <div className="text-white text-center py-5 px-4 my-5">
          <div>
            <h2 className="card-title h1-responsive pt-3 my-8 mb-5 font-bold"><strong>Create your beautiful website with
                MDBootstrap</strong></h2>
            <p className="mx-5 mb-5">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat fugiat, laboriosam,
              voluptatem,
              optio vero odio nam sit officia accusamus minus error nisi architecto nulla ipsum dignissimos. Odit sed
              qui, dolorum!
            </p>
            <a className="btn btn-outline-light btn-md"><i className="fa fa-clone left"></i> View project</a>
          </div>
        </div>
      </div>
    </div>
  )
}
