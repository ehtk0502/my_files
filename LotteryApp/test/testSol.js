const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../m_contract/compile');

let accounts;
let mContract;

beforeEach(async () => {
   accounts = await web3.eth.getAccounts();
   mContract = await new web3.eth.Contract(JSON.parse(interface))
       .deploy({data: bytecode}).send({from: accounts[0], gas: '1000000'});
});

describe('contract testing', () => {
   //
   it('Recieving Fund', ()=>{
    assert.ok(mContract.options.address);
   });
   
   //
   it('Manager Test', async ()=>{
    const manager = await mContract.methods.getManager().call({from: accounts[0]});
    assert.equal(accounts[0], manager);
   });
   
   //
   it('Sending Fund', async ()=>{
    await mContract.methods.recieveFund().send({from: accounts[0], value: 100000000000000000});
    
    const amount = await mContract.methods.getAmount().call({from: accounts[0]});
    assert.notStrictEqual(0, amount);
   });
   
   //
   it('Sending Less Amount', async ()=>{
    try{
        await mContract.methods.recieveFund().send({from: accounts[0], value: 10000000000});
        assert(false);
    }catch(err){
        assert.ok(err);
    }
   });
   
   //
   it('Transfering Fund', async ()=>{
    try{
        await mContract.methods.payWinner(accounts[1]).call({from: accounts[0]});
        assert(true);
    }catch(err){
        assert(false);
    }
    
    try{
        await mContract.methods.payWinner(accounts[0]).call({from: accounts[1]});
        assert(false);
    }catch(err){
        assert(err);
    }
    
   });
});
