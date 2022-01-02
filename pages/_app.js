import '../styles/globals.css'
import '../styles/spinner.css'
import '../styles/product.css'
import "../styles/assets/dist/css/bootstrap.min.css"
import "../styles/fontawesome-free-5.15.4-web/css/fontawesome.min.css"
import Link from 'next/link'

function Marketplace({ Component, pageProps }) {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow fixed-top">
        <div className="container page-header">
          <a className="navbar-brand" href="#">SlashFIRE Play2Earn</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ms-auto">
              <Link href="/catalog">
                <li className="nav-item active">
                  <a className="nav-link" href="#">Mint VGK</a>
                </li>
              </Link>
              <Link href="/redeem">
                <li className="nav-item">
                  <a className="nav-link" href="#">Redeem VGK</a>
                </li>
              </Link>
              <Link href="/nfts">
                <li className="nav-item">
                  <a className="nav-link" href="#">Mint NFT</a>
                </li>
              </Link>
              <Link href="/create-chocho">
                <li className="nav-item">
                  <a className="nav-link" href="#">Chocho</a>
                </li>
              </Link>
              <Link href="/create-dao">
                <li className="nav-item">
                  <a className="nav-link" href="#">DAO</a>
                </li>
              </Link>
              <Link href="/create-fire">
                <li className="nav-item">
                  <a className="nav-link" href="#">Mint Membership</a>
                </li>
              </Link>
            </ul>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default Marketplace
