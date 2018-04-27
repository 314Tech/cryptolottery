pragma solidity ^0.4.19;

contract Lottery {
    address public manager;
    address[] public participants;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enterLottery() public payable {
        require(msg.value === .001 ether);
        participants.push(msg.sender);
    }
    
    function random() private view returns(uint) {
        return uint(keccak256(block.difficulty, now, participants));
    }
    
    function pickWinner() public restricted {
        uint index = random() % participants.length;
        uint balance = this.balance;
        address winner = participants[index];
        participants = new address[](0);
        winner.transfer(balance);
    }
    
    function getParticipants() public view restricted returns(address[]) {
        return participants;  
    }
    
    function kill() public restricted{
        selfdestruct(manager);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    } 
}