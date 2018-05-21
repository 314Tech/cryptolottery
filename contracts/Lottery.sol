pragma solidity ^0.4.4;
import '../node_modules/openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract Lottery is Destructible {
    address public manager;
    address[] public participants;
    
    event drawEvent(uint balance);
    
    constructor() public {
        manager = msg.sender;
    }
    
    function enterLottery() public payable {
        uint exactAmount = .001 ether;
        require(msg.value == exactAmount);
        participants.push(msg.sender);
    }
    
    function random() private view returns(uint) {
        return uint(keccak256(block.difficulty, now, participants));
    }
    
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function getNumberOfParticipants() public view returns(uint) {
        return participants.length;
    }
    
    function pickWinner() public onlyOwner returns(address) {
        uint index = random() % participants.length;
        uint balance = address(this).balance;
        address winner = participants[index];
        participants = new address[](0);
        winner.transfer(balance);
        emit drawEvent(balance);
        return winner;
    }
    
    function getParticipants() public view onlyOwner returns(address[]) {
        return participants;  
    }

}