import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'
import { initializeApp, getApps } from "firebase/app"
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreateItem() {
  const [modalMessage, setModalMessage] = useState()
  const [address, setAddress] = useState('')
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  const nftOptions = [{
      name: 'Veggie One',
      description: 'The Vegan people',
      json: "https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2Fnft0.json?alt=media&token=cf0c6fb7-d972-47e7-a80d-ccefcc565207"
    },{
      name: '每日 Everyday Veggie',
      description: 'Too Orangey for Vegan',
      json: "https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2Fnft1.json?alt=media&token=ff8cfe45-53d9-4434-9fc3-d920aece9c93"
    },{
      name: 'NINETYS',
      description: 'Buy Coffee now!',
      json: "https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2Fnft2.json?alt=media&token=66e15ea3-cbd3-4c0e-ae8e-f311987b8672"
    },{
      name: "Dandy's Organic Cafe",
      description: 'Vegan - enjoy the difference',
      json: "https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2Fnft3.json?alt=media&token=638fe0a2-b140-499a-99df-fd381cb5c9bc"
    },{
      name: 'THE TEA ACADEMICS',
      description: 'Any Time, Any Place, Tea',
      json: "https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2Fnft4.json?alt=media&token=2ee211db-d330-41a6-a2a0-39a75b26dd88"
    },{
      name: 'The Coffee Academics',
      description: 'Coffee, the smart choice',
      json: "https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2Fnft5.json?alt=media&token=f4828616-f2da-46ea-bbb9-a95540f0c06e"
    }]

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== address) {
      setAddress(accounts[0]);
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.log('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    } else {
      setAddress("Non-Ethereum browser detected. You should consider installing MetaMask.")
    }
    return function cleanup() {
      //mounted = false
    }
  }, [])

  async function mint(nftOptionId) {
    if (!window.ethereum || !address) {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    } else {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(nftOptions[nftOptionId].json)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        console.log("*****tokenId", tokenId)
      } catch (error) {
        if (error.data) {
          setModalMessage(`Crypto Wallet Error: ${error.data.message}`)
        } else {
          setModalMessage(`Crypto Wallet Error: ${error.message}`)
        }
      }
    }
  }

  if (modalMessage) return (
    <div className="p-4">
      <p>{modalMessage}</p>
    </div>
  )
  return (
<div>
  <div className="b-example-divider"></div>

  <div className="container px-4 py-5" id="custom-cards">
    <h2 className="pb-2 mt-5 border-bottom">Self Service NFTs</h2>
    <div className="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-3">
      <div className="col">
        <div className="card card-cover h-100 overflow-hidden text-white bg-dark rounded-5 shadow-lg" style={{"backgroundImage": "url('/unsplash-photo-1.jpg')"}}>
          <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
            <h2 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">The Vegan people</h2>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => mint(0)}>Mint</button>
            <br />
            <ul className="d-flex list-unstyled mt-auto">
              <li className="me-auto">
                <Image src="/Mobileme.svg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
              </li>
              <li className="d-flex align-items-center me-3">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>Veggie One</small>
              </li>
              <li className="d-flex align-items-center">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>3d</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card card-cover h-100 overflow-hidden text-white bg-dark rounded-5 shadow-lg" style={{"backgroundImage": "url('/unsplash-photo-2.jpg')"}}>
          <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
            <h2 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Too Orangey for Vegan</h2>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => mint(1)}>Mint</button>
            <ul className="d-flex list-unstyled mt-auto">
              <li className="me-auto">
                <Image src="/Mobileme.svg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
              </li>
              <li className="d-flex align-items-center me-3">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>每日 Everyday Veggie</small>
              </li>
              <li className="d-flex align-items-center">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>4d</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card card-cover h-100 overflow-hidden text-white bg-dark rounded-5 shadow-lg" style={{"backgroundImage": "url('/unsplash-photo-3.jpg')"}}>
          <div className="d-flex flex-column h-100 p-5 pb-3 text-shadow-1">
            <h2 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Buy Coffee now!</h2>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => mint(2)}>Mint</button>
            <ul className="d-flex list-unstyled mt-auto">
              <li className="me-auto">
                <Image src="/Mobileme.svg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
              </li>
              <li className="d-flex align-items-center me-3">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>NINETYS</small>
              </li>
              <li className="d-flex align-items-center">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>5d</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-5">
      <div className="col">
        <div className="card card-cover h-100 overflow-hidden text-white bg-dark rounded-5 shadow-lg" style={{"backgroundImage": "url('/112-900x1350.jpeg')"}}>
          <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
            <h2 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Vegan - enjoy the difference</h2>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => mint(3)}>Mint</button>
            <br />
            <ul className="d-flex list-unstyled mt-auto">
              <li className="me-auto">
                <Image src="/Mobileme.svg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
              </li>
              <li className="d-flex align-items-center me-3">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>{`Dandy's Organic Cafe`}</small>
              </li>
              <li className="d-flex align-items-center">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>3d</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card card-cover h-100 overflow-hidden text-white bg-dark rounded-5 shadow-lg" style={{"backgroundImage": "url('/469-900x1350.jpeg')"}}>
          <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
            <h2 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Any Time, Any Place, Tea</h2>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => mint(4)}>Mint</button>
            <ul className="d-flex list-unstyled mt-auto">
              <li className="me-auto">
                <Image src="/Mobileme.svg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
              </li>
              <li className="d-flex align-items-center me-3">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>THE TEA ACADEMICS</small>
              </li>
              <li className="d-flex align-items-center">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>4d</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card card-cover h-100 overflow-hidden text-white bg-dark rounded-5 shadow-lg" style={{"backgroundImage": "url('/478-900x1350.jpeg')"}}>
          <div className="d-flex flex-column h-100 p-5 pb-3 text-shadow-1">
            <h2 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Coffee, the smart choice</h2>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => mint(5)}>Mint</button>
            <ul className="d-flex list-unstyled mt-auto">
              <li className="me-auto">
                <Image src="/Mobileme.svg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
              </li>
              <li className="d-flex align-items-center me-3">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>The Coffee Academics</small>
              </li>
              <li className="d-flex align-items-center">
                <svg className="bi me-2" width="1em" height="1em"></svg>
                <small>5d</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
