const mysqlx = require("@mysql/xdevapi");
const mysqlConfig = require('./mysqlConfig');
const bcrypt = require("bcrypt");
const mysql = require("mysql");

var connection = mysql.createConnection({
    host : mysqlConfig.host,
    database : mysqlConfig.database,
    user : mysqlConfig.userName,
    password : mysqlConfig.passowrd,
    // insecureAuth : true,
    
});

function startMysqlServer () {
    connection.connect(function(err){
        if (err) {
            console.log(err.stack , "please connect again")
            startMysqlServer();
        }else{
            console.log("CONNECTED")
        }
        connection.on('error' ,function(err) {
            if(err.fatal){
                startMysqlServer();
            }
        })
        console.log(`connnected as ${mysqlConfig.host} ${connection.threadId}`)
        });
}

startMysqlServer();


const createSessiontoken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const saltHash = (pass) => {
    const salt = bcrypt.genSalt(10);
    const password = bcrypt.hashSync(pass, salt);
    console.log("bycrypt password stuff , salt : " + salt + "password : " + password)
    return { salt, password }
};

let holdCommentsForGetCommentsFunc = null

const getCommentsFunc = async (resultsFromQuery) => {
    var postIdFromOtherCall = ""
    await resultsFromQuery.map((index) => {
        postIdFromOtherCall = index.id
    })
    var getCommentsForPost = `SELECT * FROM user_comments WHERE post_id=${postIdFromOtherCall}`
    connection.query(getCommentsForPost , async (error , results, fields) => {
        if(error){
            return console.log(error , "i am error")
        }else if(results.length === 0){
            console.log('an error has occured' , error)
            return 
        }else{
            holdCommentsForGetCommentsFunc = await results
            // console.log(results , "final results")
            return results
        }
    })
}


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
            res.send("An error has occured" , error)
        } else if(results.length === 0){
            res.send('Invalid Username or Password')
        }else if (results.length !== 0){
            res.status(200).json({
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
                // console.log(results)
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
                res.status(404).send("An error has occured" , error)
            }else{
                res.status(200).send(results)
            }
        })
    },






    exports.getUserNameForComments = async function (req, res) {
        // console.log(req.params.id1)
        let userId = [req.params.id1]
        // console.log(userId , "please be able to find me")
        userId.map((index) => {
            var getUsernames = `SELECT username FROM account_info WHERE ${index}`
            connection.query( getUsernames , async (error ,results, fields) => {
            // })
                if(error){
                    console.log(error)
                    res.status(404).send(error)
            }else if(results.length === 0){
                console.log('results are empty')
                res.status(404).send("An error has occured" , error)
            }else{
                console.log(results , "loooook at meeee abcd")
            }
            })
        })
        // let random = [req.params]
        // console.log(req)
        // console.log(random , "random shiiitt")
        // console.log(res , "respooooonnnssee")
    }





    exports.getAllInfoOnPost = async function (req, res) {
        var requestId = req.params.id1
        // console.log(requestId)
        var getPostDetails = `SELECT * FROM user_posts WHERE id=${requestId}`
          connection.query( getPostDetails , async (error , results, fields) => {
            if(error){
                    console.log(error)
                    res.status(404).send(error)
            }else if(results.length === 0){
                console.log('results are empty')
                res.status(404).send("An error has occured", error)
            }else{
                await getCommentsFunc(results)
                if(holdCommentsForGetCommentsFunc === null || holdCommentsForGetCommentsFunc === holdCommentsForGetCommentsFunc) {
                    setTimeout( async () => {
                        var newVarForStuff = await holdCommentsForGetCommentsFunc
                        // console.log(newVarForStuff , "new var for comments stuff")
                        var sendMe = {
                            results : await results,
                            comments : await newVarForStuff
                        }
                        // console.log(sendMe , "i wanna be whole and i wanna be sent!")
                        return res.status(202).send(sendMe)
                    } , 5 * 70)
                }
                // else{
                //     return res.status(508).send('An error has occured please refresh and try again')
                // }
            }
        })
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
                // console.log(results)
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