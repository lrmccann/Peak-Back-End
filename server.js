const express = require("express");
const routes = require("./routes/routes");
const mysql = require("mysql");
const app = express();
const PORT = process.env.PORT || 3005;
const cors = require("cors");
const sqlConfigObj = require("./sqlConfig");
const sqlConfig = sqlConfigObj.sqlConfig;
const winston = require('winston');
const expressWinston = require('express-winston');

app.use(express.static('public'));
app.use(cors());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers" , 'Authorization');
    res.setHeader("Access-Control-Allow-Origin",  "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Authorization', '')
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

    app.use(express.urlencoded({ extended: true , limit: '20mb' }));
    app.use(express.json({extended: true, limit : '20mb'}));

    // const checkMySqlServer = async () => {
    //   if(process.env.NODE_ENV === "production"){
    //   const startMysqlServer = async () => {
    //     console.error('CONNECTING');
    //     connection = mysql.createConnection(process.env.JAWSDB_URL);
    //     await connection.connect(function(err){
    //         if(err){
    //             console.error('CONNECTION FAILED' , err.code);
    //             // startMysqlServer();
    //         }else{
    //             console.error("CONNECTED PROD");
    //         }
    //     });
    //     connection.on("error" , function(err) {
    //         if(err.fatal){
    //             throw err.fatal;
    //             // startMysqlServer();
    //         }
    //     })
    // }
    // startMysqlServer();
    //   }else if(process.env.NODE_ENV === 'development') {
    //     const startMysqlServerLocalHost = async () => {
    //       console.log(sqlConfig);
    //      connection = mysql.createConnection(sqlConfig);
    //     await connection.connect(function(err){
    //         if (err) {
    //             console.log(err , "please connect again")
    //             // startMysqlServerLocalHost();
    //         }else{
    //             console.log("CONNECTED DEV")
    //         }
    //         connection.on('error' ,function(err) {
    //             if(err.fatal){
    //                 // startMysqlServerLocalHost();
    //                 throw err.fatal;
    //             }
    //         })
    //         });
    // }
    // startMysqlServerLocalHost();
    //   }
    // }
    // checkMySqlServer();

    app.use(expressWinston.logger({
        transports: [
          new winston.transports.Console()
        ],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.json()
        ),
        msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        meta: true,
        expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
        // ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
      }));

    app.use(routes);

    app.use(expressWinston.errorLogger({
        transports: [
          new winston.transports.Console()
        ],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.json()
        ),
        meta: true,
        expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      }));

    
// const checkMySqlServer = async () => {
//   if(process.env.NODE_ENV === "production"){
//   const startMysqlServer = async () => {
//     console.error('CONNECTING');
//     connection = mysql.createConnection(process.env.JAWSDB_URL);
//     await connection.connect(function(err){
//         if(err){
//             console.error('CONNECTION FAILED' , err.code);
//             startMysqlServer();
//         }else{
//             console.error("CONNECTED PROD");
//         }
//     });
//     connection.on("error" , function(err) {
//         if(err.fatal){
//             throw err.fatal;
//             // startMysqlServer();
//         }
//     })
// }
// startMysqlServer();
//   }else {
//     const startMysqlServerLocalHost = async () => {
//       console.log(sqlConfig);
//      connection = mysql.createConnection(sqlConfig);
//     await connection.connect(function(err){
//         if (err) {
//             console.log(err.stack , "please connect again")
//             startMysqlServerLocalHost();
//         }else{
//             console.log("CONNECTED DEV")
//         }
//         connection.on('error' ,function(err) {
//             if(err.fatal){
//                 // startMysqlServerLocalHost();
//                 throw err.fatal;
//             }
//         })
//         });
// }
// startMysqlServerLocalHost();
//   }
// }
// checkMySqlServer();

app.get('/' , (req , res) => {
    res.send("Welcome to Peak")
})

// app.listen(PORT);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


// console.log(`server started on ${PORT}`);