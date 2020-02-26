import React from 'react';
import './App.css';
import web3 from './web3';
import localContract from './localContract';

function uniqueNum(a, b, c){
    if(a === b || a === c || c === a){
        alert("Please Enter Non-Duplicate Numbers");
        return true;
    }
    
    return false;
} 

class App extends React.Component {
  constructor(props){
    super(props);
    
    this.getFundAmount = this.getFundAmount.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.sendFund = this.sendFund.bind(this);
    
    this.state = {
        manager : '',
        Fund : '0',
        Numbers : [0, 0, 0]
    };
  }
  
  
  handleInput(e){
    e.preventDefault();
    const index = parseInt(e.target.name, 10);
    const m_val = parseInt(e.target.value, 10);
    
    this.setState(state => {state.Numbers[index] = m_val});
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
    e.preventDefault();
    
    const notUnique = uniqueNum(...this.state.Numbers);
    if(notUnique){
        return;
    }
    
    var m_acc;
    
    await web3.eth.getAccounts(function(err, accounts){
        if(err){
            console.log(err);
            return;
        }
        
        m_acc = accounts[0];
    });
    
    
    var _num1 =  this.state.Numbers[0];
    var _num2 = this.state.Numbers[1];
    var _num3 = this.state.Numbers[2];
    
    
    await localContract.methods.recieveFund().send({
        from: m_acc,
        value: 20000000000000000
    }, function(error, transactionHash){
           if(error){
               console.log(error);
               return;
           }
       
            const stringHash = transactionHash.toString();
            console.log(stringHash);
            
            var data = {id: stringHash,
                        acc : m_acc,
                        num1: _num1,
                        num2: _num2,
                        num3: _num3
            };
            
            const response = fetch('http://localhost:8000/', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                headers:{
                    'Content-Type': 'application/json'
                },
                referrerPolicy: 'no-referrer',
                body: JSON.stringify(data)
            });
            
       }   
    );
    
    
    /*
    await fetch('http://localhost:8000/')
    .then(res => res.json())
    .then(a => console.log(a[0]));
    */
    
    
    
    /*
    const response = await fetch('http://localhost:8000/', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers:{
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    */
    
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
            <p>Enter Numbers from 1 to 25</p>
            
            <form onSubmit={this.sendFund}>
                
                <label>
                Number 1:
                <input type='number' name ='0' min={1} max={25} onChange={this.handleInput} required/> 
                </label>
                
                <label>
                Number 2:
                <input type='number' name ='1' min={1} max={25} onChange={this.handleInput} required/> 
                </label>
                
                <label>
                Power:
                <input type='number' name ='2' min={1} max={25} onChange={this.handleInput} required/> 
                </label>
                
                <br/>
                <input type='submit' value='Submit' />
                
            </form>
            
        </div>
    );
  }
}

export default App;
