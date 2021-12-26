import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'
import { initializeApp, getApps } from "firebase/app"
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import mergeImages from 'merge-images';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress, network_name
} from '../config'

import chocho_config from '../chocho_config.json'
import allowance_config from '../allowance_config.json'
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
    abi: Chocho.abi,
    display: {
      title: 'GOOD GOOD',
      tagline: 'Vegan - enjoy the difference.',
      id: 0,
      local_image: '/958-200x300.jpeg'
    }
  },{
    address: BREWaddress, // The address that the token is at.
    symbol: 'BREW', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'Brew Bros Coffee',
      tagline: 'Coffee, the smart choice.',
      id: 1,
      local_image: '/313-200x300.jpeg'
    }
  },{
    address: KHMaddress, // The address that the token is at.
    symbol: 'KHM', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'Khamsa Cafe',
      tagline: "Vegan when you're out of time.",
      id: 2,
      local_image: '/77-200x300.jpeg'
    }
  },{
    address: GVGaddress, // The address that the token is at.
    symbol: 'GVG', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'Green Veggie',
      tagline: 'More Than Just a Vegan.',
      id: 3,
      local_image: '/330-200x300.jpeg'
    }
  },{
    address: GVGGaddress, // The address that the token is at.
    symbol: 'GVGG', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'GAIA VEGGIE',
      tagline: 'Vegan goes on and on.',
      id: 4,
      local_image: '/976-200x300.jpeg'
    }
  },{
    address: LNCaddress, // The address that the token is at.
    symbol: 'LNC', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'LN COFFEE',
      tagline: 'Simply Coffee!',
      id: 5,
      local_image: '/881-200x300.jpeg'
    }
  },{
    address: OVOaddress, // The address that the token is at.
    symbol: 'OVO', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'OVO CAFE',
      tagline: 'Get Serious. Get Vegan.',
      id: 6,
      local_image: '/1043-200x300.jpeg'
    }
  },{
    address: BGaddress, // The address that the token is at.
    symbol: 'BG', // A ticker symbol or shorthand, up to 5 chars.
    decimals: 18, // The number of decimals in the token
    abi: Chocho.abi,
    display: {
      title: 'Barista by Givres',
      tagline: 'Barista is the sound of the future.',
      id: 7,
      local_image: '/341-200x300.jpeg'
    }
  }]

export default function Persona() {
  const [modalMessage, setModalMessage] = useState()
  const [address, setAddress] = useState('')
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [formDisplay, updateFormDisplay] = useState({ ...(tokenOptions[0].display), id: 0, image: tokenOptions[0].display.local_image})
  const [balances, updateBalances] = useState(new Map(tokenOptions.map(item => [item.symbol, ''])))
  const [mix, updateMix] = useState({name: '', image: ''})
  const router = useRouter()

  async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== address) {
      setAddress(accounts[0]);

      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      tokenOptions.forEach((item, i) => {
        let contract = new ethers.Contract(item.address, item.abi, signer)
        contract.balanceOf(accounts[0])
          .then(res => {
            let bal = parseInt(Number(ethers.utils.formatEther( res )))
            let symbol = item.symbol
            balances[symbol] = `${bal} ${item.symbol} ($${(Math.random()*100).toFixed(2)})`
            updateBalances({...balances})
          })
          .catch(err => console.error(err))
      })
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

  async function handleOptionChanged(tokenOptionId) {
    let tokenOption = tokenOptions[tokenOptionId]

    var imageArray = [{ src: tokenOption.display.local_image, opacity: 0.8 }]
    if (mix.image) imageArray.push({ src: mix.image, opacity: 0.6 })
    mergeImages(imageArray)
      .then(b64 => {
        updateMix({...mix, image: b64})

        updateFormDisplay({
          ...formDisplay,
          title: tokenOption.display.title,
          tagline: tokenOption.display.tagline,
          image: b64,
          id: tokenOption.display.id
        })
      })
  }

  async function redeem(tokenOptionId) {
    if (!window.ethereum || !address) {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    } else {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(tokenOptions[tokenOptionId].address, tokenOptions[tokenOptionId].abi, signer)
        let eth_price = ethers.utils.parseUnits("1", 'ether')
        let reward_total = ethers.utils.parseUnits("1", 'ether')
        let store_owner = allowance_config[network_name]["store_owner"]['address']
        let transaction = await contract.transfer(store_owner, reward_total)
        await transaction.wait()

        contract.balanceOf(address)
          .then(res => {
            let bal = parseInt(Number(ethers.utils.formatEther( res )))
            let symbol = tokenOptions[tokenOptionId].symbol
            balances[symbol] = `${bal} ${symbol} ($${(Math.random()*100).toFixed(2)})`
            updateBalances({...balances})
          })
          .catch(err => console.error(err))
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
    <div className="container-fluid bg-dark ">
      <div className="row">
        <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className="nav-link" aria-current="page" href="#">
                  <Image onClick={() => handleOptionChanged(0)} src="/958-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 0 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[0].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(1)} src="/313-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 1 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[1].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(2)} src="/77-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 2 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[2].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(3)} src="/330-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 3 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[3].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(4)} src="/976-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 4 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[4].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(5)} src="/881-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 5 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[5].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(6)} src="/1043-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 6 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[6].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#">
                  <Image onClick={() => handleOptionChanged(7)} src="/341-200x300.jpeg" alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <br />
                  <span className={formDisplay.id === 7 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[7].symbol]}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="bg-dark text-secondary px-4 py-5 text-center">
            <div className="py-5">
              <h1 className="display-5 fw-bold text-white">{formDisplay.title}</h1>
              <div className="col-lg-6 mx-auto">
                <p className="fs-5 mb-4">{formDisplay.tagline}</p>
                <button type="button" className="btn btn-outline-info btn-lg fw-bold" onClick={() => redeem(formDisplay.id)}>
                  <Image src={formDisplay.image} alt="Bootstrap" width="32" height="32" className="rounded-circle border border-white" />
                  <div>Redeem</div>
                </button>
              </div>
              <br/>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <Image className="bg-light shadow-sm mx-auto" src={formDisplay.image} width="200" height="300" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
