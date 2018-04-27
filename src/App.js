import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

const LotteryTime = 60*60*1000;
class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  constructor(props) {
    super(props);

    setTimeout(this.pickAWinner, LotteryTime);
  }

  async refreshParams() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getParticipants().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }
  async componentDidMount() {
    this.refreshParams();
  }

  onSubmit = async event => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

     this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered!' });
    this.refreshParams();
  };

  pickAWinner = async () => {
    const accounts = await web3.eth.getAccounts();

    if (accounts.length < 2) {
      this.setState({ message: 'Extending the drawing for another hour' });
      setTimeout(this.pickAWinner, LotteryTime);
      return;
    }

    this.setState({ message: 'Waiting on Winner to be picked...' });

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked!' });
    this.refreshParams();
  };

  render() {
    return (
      <div>
        <h2>1 hour lottery</h2>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
