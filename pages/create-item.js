import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

import Modal from './components/Modal'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [showModalIPFS, setShowModalIPFS] = useState(false);
  const [showModalMint, setShowModalMint] = useState(false);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
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
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createSale(url) {
    setShowModalMint(true)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    setShowModalMint(false)
    router.push('/')
  }

  return (
    <div>
    <div className="p-4">
      <h2 className="text-2xl py-2">Please upload a creative work using the Choose File button, then use the Create Digital Asset button to mint the NFT into your collection</h2>
    </div>
    <div className="flex justify-center">
      <Modal
        onClose={() => setShowModalIPFS(false)}
        show={showModalIPFS}
      >
        Please wait. Your creative work is uploading to IPFS and we will close this popup automatically when ready ...
      </Modal>
      <Modal
        onClose={() => setShowModalMint(false)}
        show={showModalMint}
      >
        <p>Please wait. Your METAMASK will prompt you for minting NFT, and then again for adding to marketplace.</p>
        <p>We will close this popup automatically when ready.</p>
      </Modal>
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <Image className="rounded mt-4" width="175" height="350" src={fileUrl} alt="uploaded file" />
          )
        }
        <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={createMarket}>
          Create Digital Asset
        </button>
      </div>
    </div>
    </div>
  )
}
