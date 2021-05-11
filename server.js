const express = require("express");
const routes = require("./routes/routes");
const mysqlConfig = require("./Controller/mysqlConfig");
const mysql = require("mysql");
const app = express();
const PORT = process.env.PORT || 3005;
const cors = require("cors");

app.use(express.static('public'));
console.log(process.env, "here")
app.use(cors());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin",  "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

    app.use(express.urlencoded({ extended: true , limit: '20mb' }));
    app.use(express.json({extended: true, limit : '20mb'}));

    app.use(routes);

  if(process.env.NODE_ENV === "production"){
  const startMysqlServer = async () => {
    console.error('CONNECTING');
    connection = mysql.createConnection(process.env.JAWSDB_URL);
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
  }else {
    function startMysqlServerLocalHost () {
let connection = mysql.createConnection({
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

app.listen(PORT);

console.log(`server started on ${PORT}`);