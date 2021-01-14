const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var routes = require("./routes/routes");
const mysqlConfig = require("./Controller/mysqlConfig");
const mysql = require("mysql");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });

  const startMysqlServer = async () => {
    console.error('CONNECTING');
    connection = mysql.createConnection(mysqlConfig);
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

app.get('/' , (req , res) => {
    res.send("Welcome to Peak")
})

routes(app);



app.listen(PORT);

console.log(`server started on ${PORT}`);