const mysqlx = require("@mysql/xdevapi");
const mysqlConfig = require('../mysqlConfig');
const bcrypt = require("bcrypt");
const mysql = require("mysql");

var connection = mysql.createConnection({
    host : mysqlConfig.host,
    database : mysqlConfig.database,
    user : mysqlConfig.userName,
    password : mysqlConfig.passowrd,
    insecureAuth : true,
    
});

connection.connect(function(err){
if (err) {
    console.log(err.stack , "please connect again")
    return;
}
console.log(`connnected as ${mysqlConfig.host} ${connection.threadId}`)
});


const createSessiontoken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const saltHash = (pass) => {
    const salt = bcrypt.genSalt(10);
    const password = bcrypt.hashSync(pass, salt);
    console.log("bycrypt password stuff , salt : " + salt + "password : " + password)
    return { salt, password }
};


// controller methods for account-info
exports.createNewUser = async function (req, res) {
    console.log("requuuuueeeest", req)
    console.log("respoooonnnssseee", res)

},

exports.authenticateUser = async function (req , res) {
    var username = await req.params.id1;
    var password = await req.params.id2;
    var sqlAccountInfo = `SELECT * FROM account_info WHERE username = '${username}' AND password = '${password}'`
    connection.query(sqlAccountInfo , (error , results , fields) => {
        if(error){
            res.send("An error has occured")
        } else if(results.length == 0){
            res.status(404).send("Invalid Username or Password")
        }else if (results.length !== 0){
            res.status(200).send({
                results : results,
                sessionToken : createSessiontoken()
            })
        }
    })
}

    exports.getAllUsers = async function (req, res) {
        var sqlAccountInfo = `SELECT * FROM account_info`;
        connection.query(sqlAccountInfo , (error , results , fields) => {
            if (error){
                return console.log(error)
            }else{
                console.log(results)
            }
        });
    },

    exports.listUserInfo = async function (req, res) {
        var first_name = req.params.id1
        var password = req.params.id2
        var getSpecificUser = `SELECT * FROM account_info WHERE name=${first_name} || password=${password}`
    },

    exports.deleteAccount = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },

    // routes for user-posts

    exports.postNewBlog = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },





    exports.getAllPosts = async function (req, res) {
        var getAllPosts =  `SELECT * FROM user_posts`;
        connection.query(getAllPosts , (error , results, fields) => {
            if(error){
                return console.log(error)
            }else if(results.length === 0){
                res.status(404).send("An error has occured")
            }else{
                res.status(200).send(results)
            }
        })
    },



    

    exports.getAllInfoOnPost = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },

    exports.deleteUserPost = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },

    // routes for user comments

    exports.postNewComment = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },

    exports.loadPreviewComments = async function (req, res) {
        var getAllComments = `SELECT * FROM user_comments`;
        connection.query(getAllComments , (error, results, fields) => {
            if(error){
                return console.log(error)
            }else{
                console.log(results)
            }
        })
    },

    exports.loadAllCommentsForPost = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },

    exports.deleteUserComment = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    }

    // connection.end(function(err) {
    //     if(err) {
    //         return console.log('error:' + err);
    //     }
    //     console.log('mysql connection closed')
    // })