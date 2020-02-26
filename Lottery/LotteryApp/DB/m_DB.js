var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password : "",
  database: "mydb"
});


/*
con.connect(function(err) {
  if(err){ 
    throw err;
  }
  
  console.log("Connected!");
  
  // needed if DB was not created.
  
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database Created");
  });
  
  
  // Data Definition Language. Create Table. Reciept Number from the transaction will be used as primary key.
  
  const m_query = "CREATE TABLE mydata (iden VARCHAR(100) PRIMARY KEY, account VARCHAR(100), numF INT, numS INT, numP INT)"
  con.query(m_query, function (err, result){
      if(err) throw err;
      console.log("Table Created");
  });
  
  
});


*/

