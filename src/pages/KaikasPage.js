import React, { Component } from 'react'
import CaverExtKAS from 'caver-js-ext-kas'
import caver from '../klaytn/caver'
import WalletInfo from '../components/WalletInfo'
import './KaikasPage.scss'

// console.log(process.env.ACCESS_KEY_ID)
// console.log(process.env.SECRET_ACCESS_KEY)
const caverExtKas = new CaverExtKAS(8217, process.env.ACCESS_KEY_ID, process.env.SECRET_ACCESS_KEY)
var index = 0 
var TokenUriList = new Set()

class KaikasPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      balance: 0,
      network: null,
    }
  }

  componentDidMount() {
    this.loadAccountInfo()
    this.setNetworkInfo()     
  }

  getImg = async(tokenUri) => {
    const { unityContext } = this.props
    const src = await fetch(tokenUri)
      .then(function (response){
        return response.json();
      })
      .then(function (json){
        var reg = /(.*?)\.(jpg|jpeg|png|webp)$/;
        if (index < 5 && json.image.match(reg))
        {
          console.log('hey ', json.image, index.toString())
          unityContext.send("Plane"+index.toString(), "updateUrl", json.image)
          index += 1
        }
      });
  }
  
  getTokenUri = async(contractAddress) => {
    const { account } = this.state 
    const ret = await caverExtKas.kas.tokenHistory.getNFTListByOwner(contractAddress, account)
    ret.items.forEach(async (element)=>{
      if (!TokenUriList.has(element.tokenUri))
      {
        await this.getImg(element.tokenUri).then(()=>{
          TokenUriList.add(element.tokenUri)
        })
      }
    })
  }

  getNFTConstractList = async() => {
    // Get NFT contract list (default size in query: 100) by Owner Address. 
    // Using this list, get NFT List owned by Account and retrieve Img URIs. 

    const {account} = this.state 
    index = 0
    const query = {
      kind: [caverExtKas.kas.tokenHistory.queryOptions.kind.NFT],
      toOnly: true,
    }
    const result = await caverExtKas.kas.tokenHistory.getTransferHistoryByAccount(account, query)

    var NFTContractAddress = new Set()
    result.items.forEach(element => {
      NFTContractAddress.add(element.contract.address)
    })
    NFTContractAddress.forEach(async (contractAddress) => {
      await this.getTokenUri(contractAddress)
    })
  }
  
  loadAccountInfo = async () => {
    const { klaytn } = window
    if (klaytn) {
      try {
        await klaytn.enable()
        this.setAccountInfo(klaytn)
        klaytn.on('accountsChanged', () => this.setAccountInfo(klaytn))

      } catch (error) {
        console.log('User denied account access')
      }
    } else {
      console.log('Non-Kaikas browser detected. You should consider trying Kaikas!')
    }
  }

  setAccountInfo = async () => {
    const { klaytn } = window
    if (klaytn === undefined) return

    const account = klaytn.selectedAddress
    const balance = await caver.klay.getBalance(account)
    this.setState({
      account,
      balance: caver.utils.fromPeb(balance, 'KLAY'),
      NFTContractAddList: new Set(),
      imgAddressList: 0,
    })
  }

  setNetworkInfo = () => {
    const { klaytn } = window
    if (klaytn === undefined) return

    this.setState({ network: klaytn.networkVersion })
    klaytn.on('networkChanged', () => this.setNetworkInfo(klaytn.networkVersion))
  }

  render() {
    const { account, balance} = this.state
    const { unityLoaded } = this.props
    console.log('loaded: ', unityLoaded)
    if (unityLoaded) 
    {
      this.getNFTConstractList()
    }

    return (
      <div className="KaikasPage">
        <div className="KaikasPage__main">
          <WalletInfo address={account} balance={balance}/>
        </div>
      </div>
    )
  }
}

export default KaikasPage
