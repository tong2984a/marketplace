import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'
import { initializeApp, getApps } from "firebase/app"
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
const pant = require("nearest-pantone")

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
    pantone: "Summer-Green",
    hex: "#7ed37f",
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
    pantone: "Paradise-Pink",
    hex: "#e4445e",
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
    pantone: "Soothing-Sea",
    hex: "#c3e9e4",
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
    pantone: "Latte",
    hex: "#c5a582",
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
    pantone: "Monks-Robe",
    hex: "#704822",
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
    pantone: "Lichen-Blue",
    hex: "#5d89b3",
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
    pantone: "Sunburn",
    hex: "#b37256",
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
    pantone: "Chai-Tea",
    hex: "#b1832f",
    display: {
      title: 'Barista by Givres',
      tagline: 'Barista is the sound of the future.',
      id: 7,
      local_image: '/341-200x300.jpeg'
    }
  }]

export default function Lipstick() {
  const [modalMessage, setModalMessage] = useState()
  const [address, setAddress] = useState('')
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [formDisplay, updateFormDisplay] = useState({ ...(tokenOptions[0].display), id: 0, image: tokenOptions[0].display.local_image})
  const [balances, updateBalances] = useState(new Map(tokenOptions.map(item => [item.symbol, ''])))
  const [mix, updateMix] = useState({name: '', hex: ''})
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
            document.getElementById('swatch').style.backgroundColor="black"
            //console.log("*** mix", ((i + 1) * bal) + mix)
            balances[symbol] = `${bal} ${capitalizeTheFirstLetterOfEachWord(item.pantone)}`
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

  function hex2dec(hex) {
    return hex.replace('#', '').match(/.{2}/g).map(n => parseInt(n, 16));
  }

  function rgb2hex(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
  }

  function rgb2cmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    return [c, m, y, k];
  }

  function cmyk2rgb(c, m, y, k) {
    let r = c * (1 - k) + k;
    let g = m * (1 - k) + k;
    let b = y * (1 - k) + k;
    r = (1 - r) * 255 + .5;
    g = (1 - g) * 255 + .5;
    b = (1 - b) * 255 + .5;
    return [r, g, b];
  }

  function mix_cmyks(...cmyks) {
    let c = cmyks.map(cmyk => cmyk[0]).reduce((a, b) => a + b, 0) / cmyks.length;
    let m = cmyks.map(cmyk => cmyk[1]).reduce((a, b) => a + b, 0) / cmyks.length;
    let y = cmyks.map(cmyk => cmyk[2]).reduce((a, b) => a + b, 0) / cmyks.length;
    let k = cmyks.map(cmyk => cmyk[3]).reduce((a, b) => a + b, 0) / cmyks.length;
    return [c, m, y, k];
  }

  function mix_hexes(...hexes) {
    let rgbs = hexes.map(hex => hex2dec(hex));
    let cmyks = rgbs.map(rgb => rgb2cmyk(...rgb));
    let mixture_cmyk = mix_cmyks(...cmyks);
    let mixture_rgb = cmyk2rgb(...mixture_cmyk);
    let mixture_hex = rgb2hex(...mixture_rgb);
    return mixture_hex;
  }

  function capitalizeTheFirstLetterOfEachWord(words) {
     var separateWord = words.toLowerCase().split('-');
     for (var i = 0; i < separateWord.length; i++) {
        separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
        separateWord[i].substring(1);
     }
     return separateWord.join(' ');
  }

  async function handleOptionChanged(tokenOptionId) {
    let tokenOption = tokenOptions[tokenOptionId]
    updateFormDisplay({
      ...formDisplay,
      title: tokenOption.display.title,
      tagline: tokenOption.display.tagline,
      image: tokenOption.display.local_image,
      id: tokenOption.display.id
    })

    var colourArray = [tokenOption.hex]
    if (mix.hex) colourArray.push(mix.hex)
    let newColor = mix_hexes(...colourArray)
    let pantoneColor = pant.getClosestColor(newColor)
    pantoneColor.name = capitalizeTheFirstLetterOfEachWord(pantoneColor.name)
    updateMix(pantoneColor)
    document.getElementById('swatch').style.backgroundColor=newColor
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
                <a className="nav-link" aria-current="page" href="#" onClick={() => handleOptionChanged(0)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[0].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 0 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[0].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(1)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[1].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 1 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[1].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(2)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[2].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 2 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[2].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(3)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[3].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 3 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[3].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(4)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[4].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 4 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[4].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(5)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[5].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 5 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[5].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(6)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[6].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 6 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[6].symbol]}
                  </span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-sm" href="#" onClick={() => handleOptionChanged(7)}>
                  <div>
                    <div className="glossy-button border border-white" style={{"backgroundColor": tokenOptions[7].hex}}></div>
                  </div>
                  <span className={formDisplay.id === 7 ? "text-sm" : "text-white text-sm"}>
                    {balances[tokenOptions[7].symbol]}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="bg-dark text-secondary px-4 py-5 text-center justify-content-sm-center">
            <div className="py-5">
              <h1 className="display-5 fw-bold text-white">Lipstick NFT</h1>

              <div className="col-lg-6 mx-auto text-center justify-content-sm-center">
                <p className="fs-5 mb-4">{`It's Your Blend. Mint It.`}</p>
                <button type="button" className="btn btn-outline-info btn-lg fw-bold" onClick={() => redeem(formDisplay.id)}>
                  <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <div className="glossy-button border border-white" id="swatch" style={{"backgroundColor":"black", "height":"144px", "width":"144px"}}></div>
                  </div>
                  <p>{mix.name}</p>
                  <div>Redeem</div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
