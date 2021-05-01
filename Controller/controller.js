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
  multipleStatements: true,
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

function createObjForComments(username, commentBody, commentRank, joinDate) {
  this.username = username;
  this.commentBody = commentBody;
  this.commentRank = commentRank;
  this.joinDate = joinDate;
}

// function createObjForBookmarkedPosts(postId, postTitle, blogImg, publishDate, blogAuth){
//   this.postId = postId;
//   this.postTitle = postTitle;
//   this.blogImg = blogImg;
//   this.publishDate = publishDate;
//   this.blogAuth = blogAuth;
// }

const getUserBookmarks = async (userId, myCallback) => {
  await connection.query(
    `SELECT bookmarked_posts FROM account_info WHERE id=${userId}`,
    (error, results) => {
      if (error) {
        console.log("error error error" + error);
      } else {
        var postsToFetch = results[0].bookmarked_posts;
        var newArr = postsToFetch.split(",").map(Number);
        return myCallback(newArr);
      }
    }
  );
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
  connection.query(mysqlQuery, (error, results) => {
    if (error) {
      res.status(404).send(error);
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
    connection.query(sqlAccountInfo, (error, results) => {
      if (error) {
        res.status(404).send(error);
      } else if (results.length === 0) {
        res.send("Invalid Username or Password");
      } else if (results.length !== 0) {
        let removeArr = null;
        results.map((index) => {
          removeArr = index;
        });
        res.status(200).send(removeArr);
        // res.status(200).json({
        //   results: removeArr,
        //   sessionToken: createSessiontoken(),
        // });
      }
    });
  }),
  (exports.fetchUserInfo = async function (req, res) {
    var userId = await req.params.id1;
    var sqlAccountInfo = `SELECT * FROM account_info WHERE id = ${userId}`;
    connection.query(sqlAccountInfo, (error, results) => {
      if (error) {
        res.status(404).send(error);
      } else {
        let toSend = null;
        results.map((index) => {
          toSend = index;
        });
        res.status(200).send(toSend);
      }
    });
  }),
  (exports.getAllUsers = async function (req, res) {
    var sqlAccountInfo = `SELECT * FROM account_info`;
    connection.query(sqlAccountInfo, (error, results, fields) => {
      if (error) {
        return console.log(error);
      } else {
        return;
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
    var query = `SELECT * FROM user_posts WHERE user_id=${userId} ORDER BY blog_likes DESC`;
    connection.query(query, (error, results) => {
      if (error) {
        res
          .status(404)
          .send(
            "We're having some trouble loading this right now, please try again later"
          );
      } else {
        console.log(results, "results for display top posts");
        res.status(202).send(results);
      }
    });
  }),
  (exports.displayTopComments = async function (req, res) {
    var userId = await req.params.id1;
    var query = `SELECT * FROM user_comments WHERE user_id=${userId}`;
    connection.query(query, (error, results) => {
      if (error) {
        res
          .status(404)
          .send(
            "We're having some trouble loading this right now, please try again later"
          );
      } else {
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
  connection.query(postTheBlog, (error, results) => {
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
    var getPosts = `SELECT user_posts.id , user_posts.user_id , user_posts.post_title , user_posts.post_body , user_posts.blog_img , user_posts.blog_likes , user_posts.publish_date , account_info.username
                    FROM user_posts, account_info
                    WHERE user_posts.user_id = account_info.id`;
    connection.query(getPosts, async (error, results) => {
      if (error) {
        return console.log(error);
      } else if (results.length === 0) {
        res.status(404).send(error);
      } else {
        // console.log(results)
        res.status(200).send(results);
      }
    });
  }),
  (exports.getAllInfoOnPost = async function (req, res) {
    // Post ID of requested blog page
    var requestId = req.params.id1;
    // Array to store results from each query
    let allInfoArr = [];
    // Gets all data for comments related to post, creates object before pushing to array, call back to prev func
    const getCommentData = async () => {
      await connection.query(
        `SELECT * FROM user_posts posts
            INNER JOIN user_comments comments ON posts.id = comments.post_id
            INNER JOIN account_info accInfo ON comments.user_id = accInfo.id
            WHERE posts.id=${requestId}`,
        (error, results) => {
          if (error) {
            return res.status(404).send("Error getting data").t;
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
            // console.log(allInfoArr, "final array of data to send")
            res.status(200).send(allInfoArr);
          }
        }
      );
    };
    // Gets Blog body, # of likes, etc. Sends response to web page
    const getBlogDetails = async () => {
      await connection.query(
        `SELECT * FROM user_posts WHERE user_posts.id=${requestId}`,
        (fail, pass) => {
          if (fail) {
            return res.status(404).send(fail);
          } else {
            allInfoArr.push(pass[0]);
            getCommentData();
          }
        }
      );
    };
    // Function to select author's name by inner joining tables where posts id = 1, pushes auth name to array, also begins callback
    const getAuthData = async () => {
      await connection.query(
        `SELECT username from account_info accInfo
      INNER JOIN user_posts posts ON posts.user_id = accInfo.id
      WHERE posts.id=${requestId} `,
        (error, results) => {
          if (error) {
            console.log(error, "Error retrieving blog author information");
            return res
              .status(404)
              .send("Error retrieving blog author information");
          } else {
            results.map((index) => {
              allInfoArr.push(index);
            });
            getBlogDetails();
          }
        }
      );
    };
    getAuthData();
  }),
  (exports.bookmarkNewPost = async function (req, res) {
    let bookmarkedPostId = req.params.id1;
    let userId = req.params.id2;
    let finalArr = [];
    const insertNewBookmark = async (arr) => {
      let strToMatch = arr.toString();
      if (strToMatch.indexOf(bookmarkedPostId) === -1) {
        finalArr = `${arr},${bookmarkedPostId}`;
        await connection.query(
          `UPDATE account_info SET bookmarked_posts = "${finalArr}"
          WHERE id = ${userId}`,
          (error, results) => {
            if (error) {
              return res
                .status(400)
                .send(
                  "Error bookmarking post for user : " + userId + " " + error
                );
            } else {
              return res
                .status(202)
                .send(
                  `Successfully bookmarked post number ${bookmarkedPostId} for at user id ${userId}`
                );
            }
          }
        );
      } else {
        res.status(350).send(`Blog already bookmarked for user ${userId}`);
      }
    };
    getUserBookmarks(userId, insertNewBookmark);
  }),
  (exports.getBookmarkedPosts = async function (req, res) {
    var userId = await req.params.id1;
    var blogObjArray = [];
    async function whatever(arr) {
      var arrLength = arr.length;
      await arr.map(async (index) => {
        await connection.query(
          `SELECT user_posts.id , user_posts.user_id , user_posts.post_title , user_posts.blog_img , user_posts.publish_date , account_info.username , account_info.bookmarked_posts
          FROM user_posts, account_info
          WHERE user_posts.id = ${index} AND account_info.id = user_posts.user_id`,
          async (error, results) => {
            if (error) {
              return res.status(400).send("Error getting data").t;
            } else {
              blogObjArray.push(...results);
              // console.log(blogObjArray)
              //   results.map((index) => {
              //   var blogInfoObj = new createObjForBookmarkedPosts(
              //     `${index.id}`,
              //     `${index.post_title}`,
              //     `${index.blog_img}`,
              //     `${index.publish_date}`,
              //     `${index.username}`
              //   );
              //   blogObjArray.push(blogInfoObj);
              // })
            }
          }
        );
      });
      if (blogObjArray.length !== arrLength) {
        setTimeout(async () => {
          return await res.status(200).send(blogObjArray);
        }, 2 * 10);
      } else {
        return await res.status(200).send(blogObjArray);
      }
    }
    getUserBookmarks(userId, whatever);
  }),
  (exports.removeBookmarkedPost = async function (req, res) {
    var postId = await req.params.id1;
    var userId = await req.params.id2;
    var uniqueArray = [];
    const deleteBookmark = async (arr) => {
      var index = arr.indexOf(postId);
      if (index === -1) {
        arr.splice(index, 1);
        uniqueArray = await arr.toString();
        await connection.query(
          `UPDATE account_info SET bookmarked_posts = "${uniqueArray}"
                          WHERE id = ${userId}`,
          async (error, results) => {
            if (error) {
              console.log("error error error" + error);
              return res.status(300).send("Failed to remove bookmarked post");
            } else {
              return res
                .status(200)
                .send("Successfully removed bookmarked blog");
            }
          }
        );
      } else {
        return console.log("Failed because blog was not bookmarked");
      }
    };
    getUserBookmarks(userId, deleteBookmark);
  }),
  (exports.addLike = async function (req, res) {
    var numOflikesToAdd = req.params.id1;
    var postId = req.params.id2;
    var postTitle = req.params.id3;
    var addLikeQuery = `UPDATE user_posts SET blog_likes=${numOflikesToAdd} WHERE user_id=${postId} AND post_title="${postTitle}"`;
    connection.query(addLikeQuery, (error, results) => {
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
        return;
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
