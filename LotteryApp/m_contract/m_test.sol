pragma solidity ^0.4.25;

contract Funds{
    address private manager;
    uint private fund;
    
    function Funds() public{
        manager = msg.sender;
        fund = 0;
    }
    
    function addFund(int payment) public{
        fund = fund + payment;
    }

    function resetFund() public{
        fund  = 0;
    }
    
    function getFund() public view returns (uint){
        return fund;
    }
    
    function getManager() public view returns (address){
        return manager;
    }
    
    function payWinner(address winner) public{
        fund = 0;
    }
}