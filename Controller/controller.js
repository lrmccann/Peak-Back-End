const mysqlConfig = require("./mysqlConfig");
const bcrypt = require("bcrypt");
const mysql = require("mysql");

var connection = "";

var connectionInfo = mysql.createConnection({
  host: mysqlConfig.host,
  database: mysqlConfig.database,
  user: mysqlConfig.userName,
  password: mysqlConfig.passowrd,
  insecureAuth: true,
});

if (process.env.JAWSDB_URL) {
  const JAWSDB_URL =
    "mysql://abcmgygb3vzp12j8:liluc5l0j218a8nj@hwr4wkxs079mtb19.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/xj2vbbkogwll9zgl";
  connection = mysql.createConnection(JAWSDB_URL);
} else {
  connection = connectionInfo;
}

const createSessiontoken = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const saltHash = (pass) => {
  const salt = bcrypt.genSalt(10);
  const password = bcrypt.hashSync(pass, salt);
  console.log(
    "bycrypt password stuff , salt : " + salt + "password : " + password
  );
  return { salt, password };
};

function createObjForComments(username, commentBody, commentRank, joinDate){
    this.username = username;
    this.commentBody = commentBody;
    this.commentRank = commentRank;
    this.joinDate = joinDate;
}

var holdUserNamesForGetAllUsers = [];

const randomFunc = () => {
  var getUsernamesForPost = `SELECT username from account_info `;
  connection.query(getUsernamesForPost, (error, results, fields) => {
    if (error) {
      return console.log(error);
    } else if (results.length === 0) {
      console.log("results were empty");
    } else {
      holdUserNamesForGetAllUsers.push(results);
    }
  });
};

// controller methods for account-info
(exports.createNewUser = async function (req, res) {
  var firstName = await req.body.firstName;
  var lastName = await req.body.lastName;
  var username = await req.body.username;
  var email = await req.body.email;
  var password = await req.body.password;
  var age = await req.body.age;
  var city = await req.body.city;
  var zipcode = await req.body.zip;
  var jobTitle = await req.body.jobTitle;
  var registerDate = await req.body.date;
  var mysqlQuery = `INSERT INTO account_info(first_name , last_name , username , email , password , age , city , zipcode , job_title , register_date) VALUES("${firstName}" , "${lastName}" , "${username}" , "${email}" , "${password}" , ${age} , "${city}" , ${zipcode} , "${jobTitle}" , "${registerDate}" )`;
  connection.query(mysqlQuery, (error, results, fields) => {
    if (error) {
      res.status(404).send(error, "fuck ass");
    } else if (results.length === 0) {
      res.send("Please try again");
    } else if (results.length !== 0) {
      res.status(200).send("User Created Successfully");
    }
  });
}),
  (exports.authenticateUser = async function (req, res) {
    var username = await req.params.id1;
    var password = await req.params.id2;
    var sqlAccountInfo = `SELECT * FROM account_info WHERE username = '${username}' AND password = '${password}'`;
    connection.query(sqlAccountInfo, (error, results, fields) => {
      if (error) {
        res.status(404).send(error);
      } else if (results.length === 0) {
        res.send("Invalid Username or Password");
      } else if (results.length !== 0) {
        res.status(200).json({
          results: results,
          sessionToken: createSessiontoken(),
        });
      }
    });
  });

(exports.getAllUsers = async function (req, res) {
  var sqlAccountInfo = `SELECT * FROM account_info`;
  connection.query(sqlAccountInfo, (error, results, fields) => {
    if (error) {
      return console.log(error);
    } else {
      // console.log(results)
    }
  });
}),
  (exports.deleteAccount = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  }),
  // routes for user-posts

  (exports.displayTopPosts = async function (req, res) {
    var userId = await req.params.id1;
    console.log(userId, "user ID");
    var query = `SELECT * FROM user_posts WHERE user_id=${userId}`;
    connection.query(query, (error, results, fields) => {
      if (error) {
        res
          .status(404)
          .send(
            "We're having some trouble loading this right now, please try again later"
          );
      } else {
        console.error("idkwhatthefuckbegoinon");
        console.log(results, "results for display top posts");
        res.status(202).send(results);
      }
    });
  }),
  (exports.displayTopComments = async function (req, res) {
    var userId = await req.params.id1;
    var query = `SELECT * FROM user_comments WHERE user_id=${userId}`;
    connection.query(query, (error, results, fields) => {
      if (error) {
        res
          .status(404)
          .send(
            "We're having some trouble loading this right now, please try again later"
          );
      } else {
        console.log(results, "results for display top comments");
        res.status(202).send(results);
      }
    });
  });

(exports.postNewBlog = async function (req, res) {
  var imgHeader = await req.body.blogInfoToSend.imgHeaderToSend;
  var blogTitle = await req.body.blogInfoToSend.blogTitleToSend;
  var blogBody = await req.body.blogInfoToSend.blogBodyToSend;
  var userIdToSend = await req.body.blogInfoToSend.userIdToSend;
  var postTheBlog = `INSERT INTO user_posts(user_id , post_title, post_body, blog_img, blog_likes) VALUES("${userIdToSend}", "${blogTitle}", "${blogBody}", "${imgHeader}", 0);`;
  connection.query(postTheBlog, (error, results, fields) => {
    if (error) {
      res
        .status(404)
        .send("There was an error posting your blog, please try again later.");
      console.error(error);
    } else {
      console.log(
        results,
        "results from query, should just be a 202 or something?"
      );
      res.status(202).send(results);
    }
  });
}),
  (exports.getAllPosts = async function (req, res) {
    var getAllPosts = `SELECT * FROM user_posts`;
    connection.query(getAllPosts, async (error, results, fields) => {
      if (error) {
        return console.log(error);
      } else if (results.length === 0) {
        res.status(404).send(error);
      } else {
        randomFunc();
        if (holdUserNamesForGetAllUsers.length === 0) {
          setTimeout(() => {
            res.status(200).json({
              allPosts: results,
              allUsernames: holdUserNamesForGetAllUsers,
            });
          }, 2 * 100);
        } else {
          res.status(200).json({
            allPosts: results,
            allUsernames: holdUserNamesForGetAllUsers,
          });
        }
      }
    });
  }),
  (exports.getAllInfoOnPost = async function (req, res) {
    var requestId = req.params.id1;
    let allInfoArr = [];
    connection.query(
      `SELECT * FROM user_posts WHERE user_posts.id=${requestId}`,
      (fail, pass) => {
        if (fail) {
          return res.status(404).send(fail);
        } else {
          allInfoArr.push(pass[0]);
        }
      }
    );
    connection.query(
      `SELECT * FROM user_posts posts
                    INNER JOIN user_comments comments ON posts.id = comments.post_id
                    INNER JOIN account_info accInfo ON comments.user_id = accInfo.id
                    WHERE posts.id=${requestId}`,
      (error, results) => {
        if (error) {
          return res.status(404).send(error)
        } else {
          let resultsToStringify = JSON.stringify(results);
          let resultsToParse = JSON.parse(resultsToStringify);
          resultsToParse.map((index, key) => {
            var commentObj = new createObjForComments(
              `${index.username}`,
              `${index.comment_body}`,
              `${index.comment_rank}`,
              `${index.register_date}`
            );
            allInfoArr.push(commentObj);
          });
        }
      }
    );
    connection.query(`SELECT user_id FROM user_posts INNER JOIN account_info ON user_posts.user_id = account_info.id`, 
        (error, results) => {
            if(error){
                console.log(error, "Error retrieving blog author information")
                res.status(404).send("Error retrieving blog author information")
            }else{
                console.log(results, "Successfully retrieved author info")
                // res.status(200).send(results, "Successfully retrieved author info")
            }
        console.log(allInfoArr , "abcdefghi")
    });
  }),
  (exports.addLike = async function (req, res) {
    // console.log(req.params, "i am the requeeessstttt for add like");
    var numOflikesToAdd = req.params.id1;
    var postId = req.params.id2;
    var postTitle = req.params.id3;
    var addLikeQuery = `UPDATE user_posts SET blog_likes=${numOflikesToAdd} WHERE user_id=${postId} AND post_title="${postTitle}"`;
    connection.query(addLikeQuery, (error, results, fields) => {
      if (error) {
        return console.log(error);
      } else if (results.length === 0) {
        res.status(404).send(error);
      } else {
        console.log(results, "results of adding likes to table");
        res.status(200).send(results);
      }
    });
  }),
  (exports.deleteUserPost = async function (req, res) {
    console.log("requuuuueeeest for delete", req);
    const query = `DELETE FROM user_posts WHERE id=${req.params.id1}`;

    connection.query(query, (error, results, fields) => {
      if (error) {
        return console.log(error);
      } else if (results.length === 0) {
        res.status(404).send(error);
      } else {
        console.log(results, "results of adding likes to table");
        res.status(200).send(results);
      }
    });
  }),
  // routes for user comments

  (exports.postNewComment = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  }),
  (exports.loadPreviewComments = async function (req, res) {
    var getAllComments = `SELECT * FROM user_comments`;
    connection.query(getAllComments, (error, results, fields) => {
      if (error) {
        return console.log(error);
      } else {
        // console.log(results)
      }
    });
  }),
  (exports.loadAllCommentsForPost = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  }),
  (exports.deleteUserComment = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  });

// connection.end(function(err) {
//     if(err) {
//         return console.log('error:' + err);
//     }
//     console.log('mysql connection closed')
// })
