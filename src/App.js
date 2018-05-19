import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import Countdown from 'react-countdown-now';

const LotteryTime = 30*1000;
class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    time: ''
  };

  constructor(props) {
    super(props);
  }

  async refreshParams() {
    const players = await lottery.methods.getParticipants().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    console.log(`Players: ${players.length}`);
    this.setState({ players, balance });
  }

  componentDidMount() {
    lottery.methods.manager().call()
    .then((manager)=>{
      this.setState({ manager }); 
      this.setState({time: Date.now() + LotteryTime});
      setTimeout(this.pickAWinner, LotteryTime);
      this.refreshParams();
    }) 
  }

  onSubmit = async event => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

     this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    await this.refreshParams();
    this.setState({ message: 'You have been entered!' });
  };

  pickAWinner = async () => {
    const accounts = await web3.eth.getAccounts();

    if (this.state.players < 2) {
      this.setState({ message: 'Extending the drawing for another hour' });
      this.setState({time: Date.now() + LotteryTime});
      setTimeout(this.pickAWinner, LotteryTime);
      return;
    }

    this.setState({ message: 'Waiting on Winner to be picked...' });
    await lottery.methods.pickWinner().call({
      from: this.state.manager
    });
    await this.refreshParams();
    this.setState({ message: 'A winner has been picked!' });
  };

  render() {
    return (
      <div>
        <h2>60 minutes lottery</h2>
        <div>
          <Countdown date={this.state.time} />
        </div>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <button
            onClick = {event => this.setState({ value: "0.001"})}
          >Enter with 0.001 Ethers</button>
        </form>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
