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

export default function DaoDIY() {
  const [fileUrl, setFileUrl] = useState(null)
  const [isImageReady, setIsImageReady] = useState(false)
  const [showModalIPFS, setShowModalIPFS] = useState(false)
  const [showModalDao, setShowModalDao] = useState(false)
  const [showModalMint, setShowModalMint] = useState(false)
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [modalMessage, setModalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [modalPendingMessage, setModalPendingMessage] = useState('')
  const [address, setAddress] = useState('')
  const [nfts, setNfts] = useState([])
  const [balances, setBalances] = useState([])
  const [mintNft, setMintNft] = useState()
  const [assetOptions, setAssetOptions] = useState()
  const [formInput, updateFormInput] = useState({ name: '', symbol: '', decimals: 0 })
  const router = useRouter()

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

  async function onChangeMint(e) {
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

  async function createDao() {
    try {
      setModalPendingMessage("Please wait. Smart contract is processing.")
      const web3Modal = new Web3Modal()
      let connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const factory = new ethers.ContractFactory(NFT.abi, NFT.bytecode, signer)
      let contract = await factory
        .deploy(
          nftmarketaddress
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
      const colRef = collection(db, 'poly-dao')
      addDoc(colRef, {
        name: formInput.name,
        fileUrl: fileUrl,
        address: contract.address,
        symbol: formInput.symbol,
        decimals: formInput.decimals,
        createdAt: Date.now()
      })

      loadFirebase()
      setModalPendingMessage("")
      setShowModalDao(false)
      setFileUrl('')
    } catch (error) {
      if (error.data) {
        setModalMessage(`Crypto Wallet Error: ${error.data.message}`)
      } else {
        setModalMessage(`Crypto Wallet Error: ${error.message}`)
      }
    }
  }

  async function register(nft) {
    if (window.ethereum) {
      try {
        // wasAdded is a boolean. Like any RPC method, an error may be thrown.
        let wasAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
              address: nft.address,
              symbol: nft.symbol,
              decimals: 0,
              image: nft.image,
              abi: NFT.abi
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

  async function mint(nft) {
    setMintNft(nft)
    setModalPendingMessage("Please wait. Smart contract is processing.")
    try {
      const web3Modal = new Web3Modal()
      let connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      let signer_address = await signer.getAddress()

      let market = new ethers.Contract(nftmarketaddress, Market.abi, signer)
      let biddingPrice = ethers.utils.parseUnits(nft.bidPrice.toString(), 'ether')
      let transaction = await market.createMarketSale(nftaddress, nft.itemId, { value: biddingPrice})
      let tx = await transaction.wait()
      setLoadingState('not-loaded')
    } catch (error) {
      if (error.data) {
        setErrorMessage(`Crypto Wallet Error: ${error.data.message}`)
      } else {
        setErrorMessage(`Crypto Wallet Error: ${error.message || error}`)
      }
    } finally {
      setModalPendingMessage("")
    }
  }

  async function createNFT() {
    setModalPendingMessage("Please wait. Smart contract is processing.")
    try {
      const added = await client.add(
        JSON.stringify({
          "description": formInput.description,
          "image": 'https://ipfs.infura.io/ipfs/QmSzQb1rkHXbk5dB8XmjZZhShADviUBnnMpbREnp9j96xe',
          "name": formInput.name
        }),
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`

      const web3Modal = new Web3Modal()
      let connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      let signer_address = await signer.getAddress()

      let contract = new ethers.Contract(mintNft.address, NFT.abi, signer)
      let transaction = await contract.createToken(url)
      let tx = await transaction.wait()
      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()

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
      const colRef = collection(db, 'poly-nft')
      addDoc(colRef, {
        name: formInput.name,
        tokenUri: url,
        address: mintNft.address,
        signer: signer_address,
        description: formInput.description,
        createdAt: Date.now()
      })
      loadFirebase()
      setModalPendingMessage("")
      setShowModalMint(false)
      setFileUrl('')
    } catch (error) {
      if (error.data) {
        setModalMessage(`Crypto Wallet Error: ${error.data.message}`)
      } else {
        setModalMessage(`Crypto Wallet Error: ${error.message}`)
      }
    }
  }

  async function handleBalanceOf(items) {
    try {
      let itemBalances = []
      const web3Modal = new Web3Modal()
      let connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      let signer_address = await signer.getAddress()
      for (var item of items) {
        let contract = new ethers.Contract(item.address, NFT.abi, signer)
        let balance = await contract.balanceOf(signer_address)
        itemBalances.push(parseInt(Number(ethers.utils.formatEther( balance ))))
      }
      setBalances(itemBalances)
    } catch(error) {
      setModalMessage(error.message || error)
    }
  }

  function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x)
      return rv
    }, {})
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
    const querySnapshot = await getDocs(collection(db, "poly-dao"));
    const items = [];
    querySnapshot.forEach((doc) => {
      let dao = doc.data();
      let item = {
        id: doc.id,
        symbol: dao.symbol,
        image: dao.fileUrl,
        name: dao.name,
        address: dao.address,
        decimals: dao.decimals
      }
      items.push(item)
    })
    //handleBalanceOf(items)
    //const myVotes = items.filter(i => i.owner.toUpperCase() === address.toUpperCase())

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    let nft = new ethers.Contract(nftaddress, NFT.abi, signer)
    let market = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let marketItems = await market.fetchMarketItems()
    let auction = await market.auction()
    let minBidIncrementPercentage = await market.minBidIncrementPercentage()
    let auctionAmount = Number(ethers.utils.formatEther( auction.amount ))
    auctionAmount = Math.max(1, auctionAmount)
    let biddingAmount = (auctionAmount + (auctionAmount * minBidIncrementPercentage / 100)) //increase next bid by 10%
    biddingAmount = (Math.ceil( biddingAmount * 100 ) / 100).toFixed(2) //round up 2 decimals

    marketItems = await Promise.all(marketItems.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        tokenId: i.tokenId.toNumber(),
        itemId: i.itemId.toNumber(),
        symbol: 'FIRE',
        image: 'https://ipfs.infura.io/ipfs/QmdCRJtV5zppqUD9vFwFwHSru6SSdQokQZZAKabuPTWKxE',
        nftContract: i.nftContract,
        decimals: 0,
        bidPrice: biddingAmount,
        tokenUri
      }
      return item
    }))
    let groups = groupBy(marketItems, 'nftContract')
    let groupBalances = Object.keys(groups).map(key => {
      return groups[key].length
    })
    let groupItems = Object.keys(groups).map(key => {
      return groups[key][0]
    })

    setNfts(groupItems)
    setBalances(groupBalances)
  }

  useEffect(() => {
    loadFirebase()
    return function cleanup() {
      //mounted = false
    }
  }, [loadingState])

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
    <div>
      <main>
        <section className="py-5 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-6 col-md-8 mx-auto">
              <h1 className="fw-light"></h1>
            </div>
          </div>
        </section>
        <div className="album py-5 bg-light">
          <div className="container">
            <div className="p-4">
              <p>{modalMessage}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
  if (showModalMint) return (
    <div className="modal modal-signin position-static d-block bg-secondary py-5" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content rounded-5 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0">
            <h2 className="fw-bold mb-0">DIY NFT Minting</h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModalMint(false)}></button>
          </div>

          <div className="modal-body p-5 pt-0">
          {
            isImageReady && (
            <form className="">
              <div className="form-floating mb-3">
                <input
                  placeholder="NFT Name"
                  className="form-control rounded-4"
                  onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <label>NFT Name</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  placeholder="NFT Description"
                  className="form-control rounded-4"
                  onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <label>NFT Description</label>
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
                  onChange={onChangeMint}
                />
                <small className="text-muted">Upload an image to begin.</small>
              </div>
            }
              {
                isImageReady &&
                <div>
                  <button className="w-100 mb-2 btn btn-lg rounded-4 btn-primary" onClick={() => createNFT()}>Mint NFT</button>
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
  if (showModalDao) return (
    <div className="modal modal-signin position-static d-block bg-secondary py-5" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content rounded-5 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0">
            <h2 className="fw-bold mb-0">DIY NFT Contract for free</h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModalDao(false)}></button>
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
                  <button className="w-100 mb-2 btn btn-lg rounded-4 btn-primary" onClick={createDao}>Create Contract</button>
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
              <h1 className="fw-light">Gift NFT</h1>
              <p>{errorMessage}</p>
            </div>
          </div>
        </section>
        <div className="album py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {nfts.map((nft, i) => (
              <div key={i} className="col">
                <div className="card shadow-sm">
                    <video key={i} autoPlay muted loop alt="NFT series" width="100%" height="100%"
                       src={nft.image} poster={nft.image} />
                  <div className="card-body">
                    <p className="card-text">{nft.bidPrice} ETH</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => register(nft)}>Register</button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => mint(nft)}>Mint</button>
                      </div>
                      <small className="text-muted">No. {balances[i]}</small>
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
          <p className="mb-1">Copyright ©2022 Pay-A-Vegan</p>
        </div>
      </footer>
    </div>
  )
}
