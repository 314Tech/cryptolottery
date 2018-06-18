pragma solidity ^0.4.20;
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Destructible.sol";

contract Lottery is Destructible {
    address public manager;
    address[] public participants;
    
    struct LotteryPick {
        address winner;
        uint time;
        uint pot;
    } 
    
    LotteryPick[] public winnersHistory ;
    
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
    
    function getHistoryCount() public view returns(uint) {
        return winnersHistory.length;
    }

    function getHistory(uint index) public view returns(address, uint, uint) {
        return (winnersHistory[index].winner, winnersHistory[index].time, winnersHistory[index].pot);
    }
    
    function pickWinner() public onlyOwner returns(address) {
        
        // Pseudo randomly choose the winner
        uint index = random() % participants.length;
        uint balance = address(this).balance;
        address winner = participants[index];
        
        // Reset the participants before the winner transaction
        participants = new address[](0);
        winner.transfer(balance);
        
        // Add the winning info to the winnersHistory
        LotteryPick memory pick = LotteryPick({winner: winner,time: now, pot: balance});
        winnersHistory.push(pick);
        emit drawEvent(balance);
        return winner;
    }
    
    function getParticipants() public view onlyOwner returns(address[]) {
        return participants;  
    }

}