import React from 'react';
import './App.css';
import web3 from './web3';
import localContract from './localContract';


class App extends React.Component {
  constructor(props){
    super(props);
    
    this.getFundAmount = this.getFundAmount.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.sendFund = this.sendFund.bind(this);
    
    this.state = {
        manager : '',
        Fund : '0',
        Numbers : [0, 0, 0, 0, 0]
    };
  }
  
  handleInput(e, props){
    e.preventDefault();
    
    
  }
  
  async componentDidMount(){
    const address = await localContract.methods.getManager().call();
    this.setState({manager: address});
  }
  
  async getFundAmount(e){
    e.preventDefault();
    const fund = await localContract.methods.getAmount().call();
    
    this.setState({Fund: fund.toString()});
  }
  
  async sendFund(e){
      
    var account;
    
    web3.eth.getAccounts(function(err, accounts){
        if(err){
            console.log(err);
            return;
        }
        
        account = accounts[0];
    });
    
    
  }
    
  render(){
    return (
        <div>
            <h1>Lottery Application Prototype</h1>
            
            <form onSubmit={this.getFundAmount}>
            
                <label>See How Much Fund Accumulated</label>
                <br />
                <input type='submit' value='Click' />
                <p>Prize: {this.state.Fund} Wei</p>
            </form>
            
            <h3>Each ticket costs 0.02 Ether</h3>
            <form onSubmit={this.sendFund}>
                
                <label>
                Number 1:
                <input type='number' index ={0} onChange={this.handleInput}/> 
                </label>
                
                <label>
                Number 2:
                <input type='number' /> 
                </label>
                
                <label>
                Number 3:
                <input type='number' /> 
                </label>
                
                <label>
                Number 4:
                <input type='number' /> 
                </label>
                
                <label>
                Power Number:
                <input type='number' /> 
                </label>
                
                <br/>
                <input type='submit' value='Submit' />
            </form>
            
        </div>
    );
  }
}

export default App;
