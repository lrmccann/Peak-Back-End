const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/routes");
const mysqlConfig = require("./Controller/mysqlConfig");
const jawsdbConfig = require("./Controller/jawsdbConfig");
const mysql = require("mysql");
const app = express();
const PORT = process.env.PORT || 3005;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const path = require('path');

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname+'/client/build/index.html'));
//   });
//   app.use(express.static(path.join(__dirname, 'client/build')));

app.use(express.static('public'));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });

  app.use(cors());

  if(process.env.NODE_ENV === "production"){
  const startMysqlServer = async () => {
    console.error('CONNECTING');
    // connection = mysql.createConnection(process.env.JAWSDB_URL);
    connection = mysql.createConnection(jawsdbConfig);
    await connection.connect(function(err){
        if(err){
            console.error('CONNECTION FAILED' , err.code);
            startMysqlServer();
        }else{
            console.error("CONNECTED");
        }
    });
    connection.on("error" , function(err) {
        if(err.fatal){
            startMysqlServer();
        }
    })
}
startMysqlServer();
  }else{
    function startMysqlServerLocalHost () {
var connection = mysql.createConnection({
    host :  mysqlConfig.host,
    database : mysqlConfig.database,
    user : mysqlConfig.userName,
    password : mysqlConfig.passowrd,
    insecureAuth : true,
    
});
    connection.connect(function(err){
        if (err) {
            console.log(err.stack , "please connect again")
            startMysqlServerLocalHost();
        }else{
            console.log("CONNECTED")
        }
        connection.on('error' ,function(err) {
            if(err.fatal){
                startMysqlServerLocalHost();
            }
        })
        console.log(`connnected as ${mysqlConfig.host} ${connection.threadId}`)
        });
}
startMysqlServerLocalHost();
  }


app.get('/' , (req , res) => {
    res.send("Welcome to Peak")
})

routes(app);

app.listen(PORT);

console.log(`server started on ${PORT}`);