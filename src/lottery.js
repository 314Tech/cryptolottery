import web3 from './web3';
import Lottery from './build/contracts/Lottery.json';
import TruffleContract from 'truffle-contract'

const lottery = TruffleContract(Lottery);
lottery.setProvider(web3.currentProvider);

export default lottery;
