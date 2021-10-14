import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

import Noun from './Noun'
// import pastAuctions, { addPastAuctions } from './state/slices/pastAuctions';
//
// import onDisplayAuction, {
//   setLastAuctionNounId,
//   setOnDisplayAuctionNounId,
// } from './state/slices/onDisplayAuction';

export default function Auction() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    //loadNFTs()
  }, [])
  const [time, setTime] = useState("")
  const [displayAuction, setDisplayAuction] = useState({lastAuctionNounId: 0})
  const [latestAuctions, setLatestAuctions] = useState([])
  const [pastAuctions, updatePastAuctions] = useState([])

// const Noun = () => {
//   return <img  src={'./loading-skull-noun.gif'}  />;
// }


  const PastAuctions = () => {
    const latestAuctionId = displayAuction.lastAuctionNounId;
    console.log("****latestAuctionId", latestAuctionId);
    //const { data } = useQuery(latestAuctionsQuery(latestAuctionId));
    const data = latestAuctions[latestAuctionId];
    console.log("****data", data);
    //const dispatch = useDispatch();

    useEffect(() => {
      data && updatePastAuctions({ data });
      console.log("****pastAuctions", pastAuctions);
    }, [data, latestAuctionId]);

    return <></>;
  };

  const TimerButton = ({ label, setTime }) => (
    <button
      className="btn btn-default"
      style={{"margin": '10px 0'}}
      onClick={() => {
          // Set the date we're counting down to
          var countDownDate = new Date("Oct 14, 2021 15:37:25").getTime();

          // Update the count down every 1 second
          var x = setInterval(function() {

            // Get today's date and time
            var now = new Date().getTime();

            // Find the distance between now and the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            let newTime = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
            setTime(newTime);

            // If the count down is finished, write some text
            if (distance < 0) {
              clearInterval(x);
            }
          }, 1000);
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <TimerButton label="Smart Contract Countdown" setTime={setTime} />
        <div>
          {time}
        </div>
        <PastAuctions />
        <Noun loadingNoun='./loading-skull-noun.gif' />
      </div>
    </div>
  )
}
