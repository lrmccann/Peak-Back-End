const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const mysqlConfig = require("./Controller/mysqlConfig");
const jawsdbConfig = require("./Controller/jawsdbConfig");
const mysql = require("mysql");
const app = express();
const PORT = process.env.PORT || 3005;
const cors = require("cors");

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(express.static('public'));

console.log(process.env, "here")

app.use(cors());


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin",  "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // res.setHeader("Access-Control-Allow-Credentials", true);
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.use(routes);


  if(process.env.NODE_ENV === "production"){
  const startMysqlServer = async () => {
    console.error('CONNECTING');
    connection = mysql.createConnection(process.env.JAWSDB_URL);
    // connection = mysql.createConnection(jawsdbConfig);
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

// routes(app);

app.listen(PORT);

console.log(`server started on ${PORT}`);