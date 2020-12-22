const mysqlx = require("@mysql/xdevapi");
const mysqlConfig = require('../mysqlConfig');
const bcrypt = require("bcrypt");


const createSessiontoken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const saltHash = (pass) => {
    const salt = bcrypt.genSalt(10);
    const password = bcrypt.hashSync(pass, salt);
    console.log("bycrypt password stuff , salt : " + salt + "password : " + password)
    return { salt, password }
}

var anotherRandomVar = null;
var accountInfoCont = null;
var userCommentsCont = null;
var userPostsCont = null;

const beginMySqlxConnection = () => {
    mysqlx.getSession({
        user: mysqlConfig.userName,
        password: mysqlConfig.passowrd
    }).then(async session => {
        const schema = await session.getSchema(mysqlConfig.defaultSchema);
        return schema.existsInDatabase()
            .then(exists => {
                console.log(exists)
                if (exists) {
                    return schema;
                }
                return session.createSchema(mysqlConfig.defaultSchema)
            })
            .then(schema => {
                return schema.getTables(mysqlConfig.tables)
            })
            .then(async tables => {
                await tables.map(async (index) => {
                    const tableNames = index.getName()
                    const collectionNames = index.select()
                        .execute()
                        .then(dataTwo => anotherRandomFun(dataTwo, tableNames))
                })
            })
    })
}

const anotherRandomFun = async (argue, name) => {
    const smallFunc = async () => {
        var getAllUserData = await argue.fetchAll();
        // console.log(getAllUserData, "asdasdfaskdlasdjkjklsd")
        return {...getAllUserData}
    }
    const objToTry = {
        tableNameForObj: name,
        tableData: await smallFunc(),
    }
    // console.log(objToTry , "objects to try?")
    anotherRandomVar = objToTry
    function sortTableData() {
        if (anotherRandomVar.tableNameForObj === 'account_info') {
            accountInfoCont = anotherRandomVar
        } else if (anotherRandomVar.tableNameForObj === 'user_comments') {
            userCommentsCont = anotherRandomVar
        } else if (anotherRandomVar.tableNameForObj === 'user_posts') {
            userPostsCont = anotherRandomVar
        }
    }
    sortTableData()
}
beginMySqlxConnection()


// controller methods for account-info
exports.createNewUser = async function (req, res) {
    console.log("requuuuueeeest", req)
    console.log("respoooonnnssseee", res)

},

    exports.getAllUsers = async function (req, res) {
        var usersToSend = await accountInfoCont
        if (!accountInfoCont) {
            res.status(404).send("Failed To Reach SQL Server")
        } else {
            res.send(usersToSend)
        }
    },

    exports.listUserInfo = async function (req, res) {
        var first_name = req.params.id1
        var password = req.params.id2


        var nothing = accountInfoCont.select('first_name' , 'password')
            where('first_name like :' + first_name && "password like :" + password)
            orderBy('name')
            .execute();

        // console.log(accountInfoCont , "hiiiiiiiii its meeeee")



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
        var postsToSend = await userPostsCont
        if (userPostsCont === "" || userPostsCont === []) {
            res.status(404).send("Failed To Reach SQL Server")
        } else {
            res.send(postsToSend)
        }

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
        var previewCommentsToSend = await userCommentsCont
        if (userCommentsCont === "" || userCommentsCont === []) {
            res.status(404).send("Failed To Reach SQL Server")
        } else {
            res.send(previewCommentsToSend)
        }


    },

    exports.loadAllCommentsForPost = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    },

    exports.deleteUserComment = async function (req, res) {
        console.log("requuuuueeeest", req)
        console.log("respoooonnnssseee", res)
    }