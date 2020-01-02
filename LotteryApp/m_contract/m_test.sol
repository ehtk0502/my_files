pragma solidity ^0.4.25;

contract Funds{
    int public fund;

    function addFund(int payment) public{
        fund = fund + payment;
    }

    function resetFund() private{
        fund  = 0;
    }

    function payWinner() private{
        fund = 0;
    }
}