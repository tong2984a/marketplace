import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { initializeApp, getApps } from "firebase/app"
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress,
  GOODaddress,
  BREWaddress,
  KHMaddress,
  GVGaddress,
  GVGGaddress,
  LNCaddress,
  OVOaddress,
  BGaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import Chocho from '../artifacts/contracts/Chocho.sol/Chocho.json'

export default function CreateItem() {
  const [modalMessage, setModalMessage] = useState()
  const [address, setAddress] = useState('')
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

  async function mint() {
    if (!window.ethereum || !address) {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    } else {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        /* next, create the item */
        let contract = new ethers.Contract(GOODaddress, Chocho.abi, signer)
        let contract_owner = "0x05C51629Af33c6Fb143B2d24a9EB3fDe2EA318a7" //ClubMember for Mumbai
        contract_owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" //NOUNS for localhost
        contract.balanceOf(contract_owner)
          .then(res => {
            console.log("****balanceOf contract_owner", parseInt(Number(ethers.utils.formatEther( res ))))
          })
          .catch(err => console.error(err))
        let eth_price = ethers.utils.parseUnits(formInput.price, 'ether')
        //eth_price = ethers.utils.parseUnits("1", 'ether')
        let reward_total = ethers.utils.parseUnits(formInput.reward_total, 'ether')
        console.log("****address", address)
        console.log("****eth_price", eth_price.toHexString())
        console.log("****reward_total", reward_total)
        //dividend.address = "0xE5C9e41248aEe0BA21f60EFA00aEF8aBb68d9d8d" //FatCave2
        //dividend.address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" //Hardhat2
        contract.balanceOf(address)
          .then(res => {
            console.log("****balanceOf address", parseInt(Number(ethers.utils.formatEther( res ))))
          })
          .catch(err => console.error(err))
        let transaction = await contract.transferFrom(contract_owner, address, reward_total)
        await transaction.wait()

        let myParameters =
          {
            from: address,
            to: contract_owner,
            value: eth_price.toHexString()
            //gas: '0x76c0', // 30400
            //gasPrice: '0x9184e72a000', // 10000000000000
            //value: '0x9184e72a', // 2441406250
            //data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
          }
        window.ethereum
          .request({ method: 'eth_sendTransaction', params: [myParameters]})
          .then((res) => console.log("*****res", res))
          .catch((err) => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log('Please connect to MetaMask.');
              setModalMessage('Connection request has been rejected. Please refresh screen to try again.');
            } else {
              console.error(err);
              setModalMessage(`Received an error message from your crypto wallet: ${err.message}`)
            }
          });

        contract.balanceOf(contract_owner)
          .then(res => {
            console.log("****balanceOf contract_owner", parseInt(Number(ethers.utils.formatEther( res ))))
          })
          .catch(err => console.error(err))
        contract.balanceOf(address)
          .then(res => {
            console.log("****balanceOf address", parseInt(Number(ethers.utils.formatEther( res ))))
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
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Please use the Create Proposal button. Your proposal will be AI rated.</h2>
      </div>
      <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
          <input
            placeholder="Pay in MATIC"
            className="mt-2 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
          <input
            placeholder="How many rewards?"
            className="mt-2 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, reward_total: e.target.value })}
          />
          <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => mint()}>
            Mint Rewards
          </button>
        </div>
      </div>
    </div>
  )
}
