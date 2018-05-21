import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import Countdown from 'react-countdown-now';
import {WalletConnector, WebConnector} from 'walletconnect';
import ReactCountdownClock from 'react-countdown-clock';
import cc from 'cryptocompare';

const LotteryTime = 10;
class App extends Component {
  

  constructor(props) {
    super(props);

    this.state = {
      account: 0x0,
      manager: '',
      players: [],
      balance: '',
      value: '',
      message: '',
      time: '',
      winner: '',
      price: 0,
    };

    this.pickAWinner = this.pickAWinner.bind(this);
    this.lotteryInstance = null;
  }

  refreshParams() {
    this.lotteryInstance.getParticipants()
    .then( (players) => {
      console.log(`Players: ${players.length}`);
      this.setState({ players});
      web3.eth.getBalance(this.lotteryInstance.address)
      .then( (balance) => {
        console.log(`Balance: ${balance}`);
        this.setState({ balance});
        })
    });


    
  }

  componentDidMount() {    
    cc.price('BTC', ['USD', 'EUR'])
    .then(prices => {
      console.log(prices)
      this.setState({price: prices.USD});
      // -> { USD: 1100.24, EUR: 1039.63 }
    })
    .catch(console.error);

    web3.eth.getCoinbase((err, account) => {
      this.setState({ account })
      lottery.deployed().then((lotteryInstance) => {
        this.lotteryInstance = lotteryInstance
        this.watchEvents();
        this.lotteryInstance.manager()
        .then((manager)=>{
          this.setState({ manager }); 
          this.setState({time: LotteryTime});
          this.refreshParams();
        })
      })
    })
  }

  watchEvents() {
    // TODO: trigger event when vote is counted, not when component renders
    this.lotteryInstance.drawEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch((error, event) => {
      this.setState({ winner: false })
    })
  }

  onSubmit = async event => {
    event.preventDefault();

    web3.eth.getAccounts()
    .then( (accounts) => {
      this.setState({ message: 'Waiting on transaction success...' });
      this.lotteryInstance.enterLottery({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether')
      }).then( () => {
        this.refreshParams();
        this.setState({ message: 'You have been entered!' });
      })
    })
  };

  pickAWinner = () => {
    web3.eth.getAccounts()
    .then( (accounts) => {
      if (this.state.players < 2) {
        this.setState({ message: 'Extending the drawing for another hour' });
        console.log("Before", this.state.time, LotteryTime);
        this.setState({time: (this.state.time === LotteryTime) ? this.state.time + 1 : this.state.time - 1 });
        console.log("After", this.state.time, LotteryTime);
        this.refreshParams();
        return;
      }
  
      this.setState({ message: 'Waiting on Winner to be picked...' });
      this.lotteryInstance.pickWinner({
        from: this.state.manager,
        gas: 70000
      }).then((winner) => {
        console.log("Winner", winner);
        this.refreshParams();
        this.setState({ message: 'A winner has been picked!' });
      }).catch((error) => {
        console.error
      });
    })   
  };

  render() {
    return (
      <div>
        <h2>60 minutes lottery</h2>
        <div>
          <ReactCountdownClock seconds={this.state.time}
                     color="green"
                     alpha={0.9}
                     size={100}
                     onComplete={this.pickAWinner}
                     />
        </div>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} (${web3.utils.fromWei(this.state.balance, 'ether')*this.state.price}) ether! Ticket price is 0.001 ETH (${0.001*this.state.price})
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <button
            onClick = {event => this.setState({ value: "0.001"})}
          >Play</button>
        </form>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
