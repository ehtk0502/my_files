pragma solidity ^0.4.25;

contract Funds{
    address private manager;
    
    constructor() public{
        manager = msg.sender;
    }
    
    function recieveFund() public payable{
        assert(msg.value >= .001 ether);
    }
    
    function payWinner(address winner) public{
        
        assert(msg.sender == manager);
        
        winner.transfer(address(this).balance);
    }
    
    function getManager() public view returns (address){
        return manager;
    }
    
    function getAmount() public view returns (uint){
        return address(this).balance;
    }

}