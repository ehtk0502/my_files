const HDprovider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');


const provider = new HDprovider(
    'mosquito film exclude assume useless goat play mix slush fog warm youth', 
    'https://rinkeby.infura.io/v3/553f3556a9b649a390f019c88bf9ea85'
);

const web3 = new Web3(provider);

const deploy = async () =>{
    
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    
    
    const m_contract = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data: bytecode}).send({from: accounts[0], gas: 1500000, gasPrice: '300000' });
    
    
    console.log(interface);
    console.log(m_contract.options.address);
    
};

deploy();