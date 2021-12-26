import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from 'next/image'
import { useRouter } from 'next/router'
import { initializeApp, getApps } from "firebase/app"
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import Chocho from '../artifacts/contracts/Chocho.sol/Chocho.json'

export default function TokenFactory() {
  const [fileUrl, setFileUrl] = useState(null)
  const [isImageReady, setIsImageReady] = useState(false)
  const [showModalIPFS, setShowModalIPFS] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [modalMessage, setModalMessage] = useState('')
  const [modalPendingMessage, setModalPendingMessage] = useState('')
  const [address, setAddress] = useState('')
  const [assets, setAssets] = useState([])
  const [assetOptions, setAssetOptions] = useState()
  const [formInput, updateFormInput] = useState({ name: '', symbol: '', decimals: 18, total_supply: '50000000000000000000000' })
  const router = useRouter()

  async function handleStart() {
    setShowModal(true)
  }

  async function handleCloseModal() {
    setShowModal(false)
  }

  async function onChange(e) {
    setShowModalIPFS(true)
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
    setShowModalIPFS(false)
  }

  const onLoadCompleteCallBack = (e)=>{
     setIsImageReady(true)
  }
  const onLoadCallBack = (e)=>{
     setIsImageReady(false)
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== address) {
      setAddress(accounts[0]);
    }
  }

  async function mint(asset) {
    if (!window.ethereum || !address) {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    } else {
      try {
        setModalPendingMessage("Please wait. Smart contract is processing.")
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        let signer_address = await signer.getAddress()

        let contract = new ethers.Contract(asset.address, Chocho.abi, signer)
        let reward_total = ethers.utils.parseUnits("1", 'ether')
        let transaction = await contract.transferFrom(signer_address, address, reward_total)
        await transaction.wait()
        setModalPendingMessage('')
      } catch (error) {
        if (error.data) {
          setModalMessage(`Crypto Wallet Error: ${error.data.message}`)
        } else {
          setModalMessage(`Crypto Wallet Error: ${error.message}`)
        }
      }
    }
  }

  async function createAsset() {
    try {
      setModalPendingMessage("Please wait. Smart contract is processing.")
      const web3Modal = new Web3Modal()
      let connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const factory = new ethers.ContractFactory(Chocho.abi, Chocho.bytecode, signer)
      let contract = await factory
        .deploy(
          formInput.name,
          formInput.symbol,
          formInput.decimals,
          formInput.total_supply
        )
      let signer_address = await signer.getAddress()
      let res = await contract.balanceOf(signer_address)

      const firebaseConfig = {
        // INSERT YOUR OWN CONFIG HERE
        apiKey: "AIzaSyBg34hCq_jGHdj-HNWi2ZjfqhM2YgWq4ek",
        authDomain: "pay-a-vegan.firebaseapp.com",
        databaseURL: "https://pay-a-vegan.firebaseio.com",
        projectId: "pay-a-vegan",
        storageBucket: "pay-a-vegan.appspot.com",
        messagingSenderId: "587888386485",
        appId: "1:587888386485:web:3a81137924d19cbe2439fc",
        measurementId: "G-MGJK6GF9YW"
      }
      if (!getApps().length) {
        //....
      }
      const app = initializeApp(firebaseConfig)
      const db = getFirestore(app)
      //const auth = getAuth(app)
      const colRef = collection(db, 'poly-chocho')
      addDoc(colRef, {
        name: formInput.name,
        fileUrl: fileUrl,
        address: contract.address,
        symbol: formInput.symbol,
        decimals: formInput.decimals,
        total_supply: formInput.total_supply,
        createdAt: Date.now()
      })
      loadFirebase()
      setModalPendingMessage("")
      setShowModal(false)
    } catch (error) {
      if (error.data) {
        setModalMessage(`Crypto Wallet Error: ${error.data.message}`)
      } else {
        setModalMessage(`Crypto Wallet Error: ${error.message}`)
      }
    }
  }

  async function register(asset) {
    if (window.ethereum) {
      try {
        // wasAdded is a boolean. Like any RPC method, an error may be thrown.
        let wasAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
              address: asset.address,
              symbol: asset.symbol,
              decimals: asset.decimals,
              image: asset.image,
              abi: Chocho.abi
            }
          }
        })
        if (wasAdded) {
          console.log('Thanks for your interest!')
        } else {
          console.log('Your loss!')
        }
      } catch(err) {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err.message || err);
        }
      }
    } else {
      setModalMessage("Unable to process without a crypto wallet. Please refresh screen to try again.")
    }
  }

  async function loadFirebase() {
    const firebaseConfig = {
      // INSERT YOUR OWN CONFIG HERE
      apiKey: "AIzaSyBg34hCq_jGHdj-HNWi2ZjfqhM2YgWq4ek",
      authDomain: "pay-a-vegan.firebaseapp.com",
      databaseURL: "https://pay-a-vegan.firebaseio.com",
      projectId: "pay-a-vegan",
      storageBucket: "pay-a-vegan.appspot.com",
      messagingSenderId: "587888386485",
      appId: "1:587888386485:web:3a81137924d19cbe2439fc",
      measurementId: "G-MGJK6GF9YW"
    };

    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const querySnapshot = await getDocs(collection(db, "poly-chocho"));
    const items = [];
    querySnapshot.forEach((doc) => {
      let asset = doc.data();
      let item = {
        id: doc.id,
        symbol: asset.symbol,
        image: asset.fileUrl,
        name: asset.name,
        address: asset.address,
        decimals: asset.decimals,
        total_supply: asset.total_supply
      }
      item.total_supply = parseInt(Number(ethers.utils.formatEther( item.total_supply )))
      items.push(item)
    })
    //const myVotes = items.filter(i => i.owner.toUpperCase() === address.toUpperCase())
    setAssets(items)
    setLoadingState('loaded')
  }

  useEffect(() => {
    loadFirebase()
    return function cleanup() {
      //mounted = false
    }
  }, [])

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

  if (showModalIPFS) return (
    <div className="modal modal-signin position-static d-block bg-secondary py-5" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content rounded-5 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0">
            <h2 className="fw-bold mb-0">Uploading image to IPFS ...</h2>
          </div>

          <div className="modal-body p-5 pt-0">
            <div className="p-4">
              <p>Please wait while we upload your character. We will close this popup automatically when ready ...</p>
              <div className="loader"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  if (modalPendingMessage) return (
    <div className="p-4">
      <p>{modalPendingMessage}</p>
      <div className="loader"></div>
    </div>
  )
  if (modalMessage) return (
    <div className="p-4">
      <p>{modalMessage}</p>
    </div>
  )
  if (showModal) return (
    <div className="modal modal-signin position-static d-block bg-secondary py-5" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content rounded-5 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0">
            <h2 className="fw-bold mb-0">DIY Token Contract for free</h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>
          </div>

          <div className="modal-body p-5 pt-0">
          {
            isImageReady && (
            <form className="">
              <div className="form-floating mb-3">
                <input
                  placeholder="Token Name"
                  className="form-control rounded-4"
                  onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <label>Token Name</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  placeholder="Token Symbol"
                  className="form-control rounded-4"
                  onChange={e => updateFormInput({ ...formInput, symbol: e.target.value })}
                />
                <label>Token Symbol</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  placeholder="Decimals (e.g. 18)"
                  className="form-control rounded-4"
                  value={formInput.decimals}
                  onChange={e => updateFormInput({ ...formInput, decimals: e.target.value })}
                />
                <label>Decimals</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  placeholder="Total Supply (e.g. 50000000000000000000000)"
                  className="form-control rounded-4"
                  value={formInput.total_supply}
                  onChange={e => updateFormInput({ ...formInput, total_supply: e.target.value })}
                />
                <label>Total Supply</label>
              </div>
            </form>
            )}
            {
              !isImageReady &&
              <div className="mb-3">
                <input
                  type="file"
                  name="Asset"
                  className="form-control rounded-4"
                  onChange={onChange}
                />
                <small className="text-muted">Upload an image to begin.</small>
              </div>
            }
              {
                isImageReady &&
                <div>
                  <button className="w-100 mb-2 btn btn-lg rounded-4 btn-primary" onClick={createAsset}>Create Contract</button>
                  <hr className="my-4" />
                </div>
              }
              {
                <div>
                  {fileUrl && (
                    <div>
                      {!isImageReady && (
                        <div>
                          <p>loading image...</p>
                          <div className="loader"></div>
                        </div>
                      )}
                      <Image onLoad={onLoadCallBack} onLoadingComplete={onLoadCompleteCallBack} className="rounded mt-4" width="175" height="350" src={fileUrl} alt="uploaded file" />
                    </div>
                  )}
                </div>
              }
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <main>
        <section className="py-5 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-6 col-md-8 mx-auto">
              <h1 className="fw-light">Self Service ERC20 Token Album</h1>
              <p className="lead text-muted">Simply upload and mint.</p>
              <p>
                <a href="#" className="btn btn-primary my-2" onClick={handleStart}>Click to start</a>
              </p>
            </div>
          </div>
        </section>
        <div className="album py-5 bg-light">
          <div className="container">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {assets.map((asset, i) => (
              <div key={i} className="col">
                <div className="card shadow-sm">
                  <Image src={asset.image} alt="Asset series" width="200" height="300" />
                  <div className="card-body">
                    <p className="card-text">{asset.name}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(asset)}>Register</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => mint(asset)}>Mint</button>
                      </div>
                      <small className="text-muted">{asset.total_supply}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))
            }
            </div>
          </div>
        </div>
      </main>

      <footer className="text-muted py-5">
        <div className="container">
          <p className="float-end mb-1">
            <a href="#">Back to top</a>
          </p>
          <p className="mb-1">Create Token for yourself!</p>
        </div>
      </footer>
    </div>
  )
}
