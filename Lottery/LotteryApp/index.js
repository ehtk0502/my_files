var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var mysql = require('mysql');



var app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send("this is my express server");

});

app.post('/', function(req, res){
    
    var m_data = req.body;
    
    var m_id = m_data.id;
    var m_acc = m_data.acc;
    var num1 = parseInt(m_data.num1, 10);
    var num2 = parseInt(m_data.num2, 10);
    var num3 = parseInt(m_data.num3, 10);
    
    
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password : "1234",
      database: "mydb"
    });
    
    con.connect(function(err) {
        if(err){ 
            throw err;
        }
        
        console.log("connection created");
        
    });
    
    
    var m_query = "INSERT INTO mydata (iden, account, numF, numS, numP) VALUES ('" 
                  + m_id +"', '" + m_acc + "', " + num1 + ", " + num2 + ", " + num3 + ")";
             
    console.log(m_query);
    
    con.query(m_query, function(err, result){
        if(err) throw err;
        console.log("data inserted");
    });
    
    con.end(function(err){
        if(err){
            throw err;
        }
        console.log("connection terminated");
    });
    
    
    res.end();
});

app.listen(8000, function(){
   console.log('server running'); 
});