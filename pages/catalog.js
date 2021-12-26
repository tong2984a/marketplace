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
  nftaddress, nftmarketaddress, network_name, contract_owner
} from '../config'

import chocho_config from '../chocho_config.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import Chocho from '../artifacts/contracts/Chocho.sol/Chocho.json'
const GOODaddress = chocho_config['GOODaddress']
const BREWaddress = chocho_config['BREWaddress']
const KHMaddress = chocho_config['KHMaddress']
const GVGaddress = chocho_config['GVGaddress']
const GVGGaddress = chocho_config['GVGGaddress']
const LNCaddress = chocho_config['LNCaddress']
const OVOaddress = chocho_config['OVOaddress']
const BGaddress = chocho_config['BGaddress']

const tokenOptions = [{
    address: GOODaddress, // The address that the token is at.
    symbol: 'GOOD', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F958-200x300.jpeg?alt=media&token=b27602ad-87e2-4a45-9d46-60ff24501b75', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: BREWaddress, // The address that the token is at.
    symbol: 'BREW', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F313-200x300.jpeg?alt=media&token=94d086ca-474e-403b-bd5a-733676077fde', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: KHMaddress, // The address that the token is at.
    symbol: 'KHM', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F77-200x300.jpeg?alt=media&token=baf5704a-1837-458e-ade0-13d5e54612fd', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: GVGaddress, // The address that the token is at.
    symbol: 'GVG', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F330-200x300.jpeg?alt=media&token=d595f73f-7da4-4ffd-8d6c-4d8ba990873e', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: GVGGaddress, // The address that the token is at.
    symbol: 'GVGG', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F976-200x300.jpeg?alt=media&token=7e048cd3-4c29-46d6-9a24-7219a6a38897', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: LNCaddress, // The address that the token is at.
    symbol: 'LNC', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F881-200x300.jpeg?alt=media&token=69e0dc64-bd06-4fb4-9529-c0a41204fdbd', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: OVOaddress, // The address that the token is at.
    symbol: 'OVO', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F1043-200x300.jpeg?alt=media&token=c917d804-fb0b-41ae-b59a-7e6f53e155b5', // A string url of the token logo
    abi: Chocho.abi,
  },{
    address: BGaddress, // The address that the token is at.
    symbol: 'BG', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    image: 'https://firebasestorage.googleapis.com/v0/b/pay-a-vegan.appspot.com/o/nft%2F341-200x300.jpeg?alt=media&token=4ba36b60-c43a-4c17-90c2-ff0059db60cf', // A string url of the token logo
    abi: Chocho.abi,
  }]

export default function Catalog() {
  const [modalMessage, setModalMessage] = useState()
  const [address, setAddress] = useState('')
  const [rewardBalance, setRewardBalance] = useState(0)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

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

  async function register(tokenOptionId) {
    if (window.ethereum) {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: tokenOptions[tokenOptionId],
        },
      })
      .then((wasAdded) => {
        if (wasAdded) {
          console.log('Thanks for your interest!');
        } else {
          console.log('Your loss!');
        }
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      })
    } else {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    }
  }

  async function mint(tokenOptionId) {
    if (!window.ethereum || !address) {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    } else {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(tokenOptions[tokenOptionId].address, tokenOptions[tokenOptionId].abi, signer)
        let reward_total = ethers.utils.parseUnits("1", 'ether')
        console.log("*******tokenOptions[tokenOptionId].address", tokenOptions[tokenOptionId].address)
        console.log("*******contract_owner", contract_owner)
        console.log("*******address", address)
        let transaction = await contract.transferFrom(contract_owner, address, reward_total)
        await transaction.wait()
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

<main>
  <div className="position-relative overflow-hidden p-3 p-md-5 m-md-3 text-center bg-light">
    <div className="col-md-5 p-lg-5 mx-auto my-5">
      <h1 className="display-4 fw-normal">Next Gen Loyalty</h1>
      <p className="lead fw-normal">So Easy, No Wonder Crypto is #1.</p>
      <a className="btn btn-outline-secondary" href="#">Coming soon</a>
    </div>
    <div className="product-device shadow-sm d-none d-md-block"></div>
    <div className="product-device product-device-2 shadow-sm d-none d-md-block"></div>
  </div>

  <div className="d-md-flex flex-md-equal w-100 my-md-3 ps-md-3">
    <div className="bg-dark me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center text-white overflow-hidden">
      <div className="my-3 py-3">
        <h2 className="display-5">GOOD GOOD</h2>
        <p className="lead">Vegan - enjoy the difference.</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(0)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(0)}>Mint</button>
        </div>
      </div>
      <div className="bg-light shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/958-200x300.jpeg')"}}></div>
    </div>
    <div className="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden">
      <div className="my-3 p-3">
        <h2 className="display-5">Brew Bros Coffee</h2>
        <p className="lead">Coffee, the smart choice.</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(1)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(1)}>Mint</button>
        </div>
      </div>
      <div className="bg-dark shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/313-200x300.jpeg')"}}></div>
    </div>
  </div>

  <div className="d-md-flex flex-md-equal w-100 my-md-3 ps-md-3">
    <div className="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden">
      <div className="my-3 p-3">
        <h2 className="display-5">Khamsa Cafe</h2>
        <p className="lead">{`Vegan when you're out of time.`}</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(2)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(2)}>Mint</button>
        </div>
      </div>
      <div className="bg-dark shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/77-200x300.jpeg')"}}></div>
    </div>
    <div className="bg-primary me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center text-white overflow-hidden">
      <div className="my-3 py-3">
        <h2 className="display-5">Green Veggie</h2>
        <p className="lead">More Than Just a Vegan.</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(3)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(3)}>Mint</button>
        </div>
      </div>
      <div className="bg-light shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/330-200x300.jpeg')"}}></div>
    </div>
  </div>

  <div className="d-md-flex flex-md-equal w-100 my-md-3 ps-md-3">
    <div className="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden">
      <div className="my-3 p-3">
        <h2 className="display-5">GAIA VEGGIE</h2>
        <p className="lead">Vegan goes on and on.</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(4)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(4)}>Mint</button>
        </div>
      </div>
      <div className="bg-body shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/976-200x300.jpeg')"}}></div>
    </div>
    <div className="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden">
      <div className="my-3 py-3">
        <h2 className="display-5">LN COFFEE</h2>
        <p className="lead">Simply Coffee!</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(5)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(5)}>Mint</button>
        </div>
      </div>
      <div className="bg-body shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/881-200x300.jpeg')"}}></div>
    </div>
  </div>

  <div className="d-md-flex flex-md-equal w-100 my-md-3 ps-md-3">
    <div className="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden">
      <div className="my-3 p-3">
        <h2 className="display-5">OVO CAFE</h2>
        <p className="lead">Get Serious. Get Vegan.</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(6)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(6)}>Mint</button>
        </div>
      </div>
      <div className="bg-body shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/1043-200x300.jpeg')"}}></div>
    </div>
    <div className="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden">
      <div className="my-3 py-3">
        <h2 className="display-5">Barista by Givres</h2>
        <p className="lead">Barista is the sound of the future.</p>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(7)}>Register</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(7)}>Mint</button>
        </div>
      </div>
      <div className="bg-body shadow-sm mx-auto" style={{"width": "200px", "height": "300px", "borderRadius": "21px 21px 0 0", "backgroundImage": "url('/341-200x300.jpeg')"}}>
    </div>
    </div>
  </div>
</main>
</div>
  )
}
