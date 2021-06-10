const argon2 = require("argon2");
const mysql = require("mysql");
const aws = require("aws-sdk");
const jwt = require("jsonwebtoken");
const mysqlConfigObj = require("../sqlConfig");
const mysqlConfig = mysqlConfigObj.sqlConfig;
const mysqlQueries = require("./sqlQueries");

var connection = "";

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_REGION,
  AWS_BUCKET,
  JWT_SIGNATURE,
} = process.env;

var connectionInfo = mysql.createConnection({
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  database: mysqlConfig.database,
  user: mysqlConfig.user,
  password: mysqlConfig.password,
  multipleStatements: true,
});

if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
  connection = connectionInfo;
}

const generateJsonWebToken = (user) => {
  const data = {
    id: user.id,
    lastName: user.last_name,
    email: user.email,
  };
  const signature = `'${JWT_SIGNATURE}'`;
  const expiration = "6h";
  return jwt.sign({ data }, signature, { expiresIn: expiration });
};

function createObjForComments(username, commentBody, commentRank, joinDate) {
  this.username = username;
  this.commentBody = commentBody;
  this.commentRank = commentRank;
  this.joinDate = joinDate;
}

// const getUserBookmarks = async (userId, myCallback) => {
//   await connection.query(
//     `SELECT bookmarked_posts FROM account_info WHERE id=${userId}`,
//     (error, results) => {
//       if (error) {
//         res.status(400).send("Problem with getting user bookmarks");
//       } 
//       else {
//         var postsToFetch = results[0].bookmarked_posts;
//         if (postsToFetch === null) {
//           console.log("was null or whatever!!!!!!!!!!!!!!")
//         } 
//         else {
//           var newBookmarkArr = postsToFetch.split(",").map(Number);
//           myCallback(newBookmarkArr);
//         }
//       }
//     }
//   );
// };

// uploading images to aws
(exports.uploadBlogImg = async function (req, res) {
  const title = req.params.id1;
  const imgType = req.params.id2;
  const base64data = new Buffer.from(req.body.dataFile.data, "base64");

  aws.config.update({
    credentials: {
      accessKeyId: `${AWS_ACCESS_KEY}`,
      secretAccessKey: `${AWS_SECRET_KEY}`,
    },
    region: `${AWS_REGION}`,
  });

  const s3 = new aws.S3();
  const someParams = {
    Bucket: encodeURI(`${AWS_BUCKET}`),
    Key: encodeURI(`blog-images/${title}.${imgType}`),
    Body: base64data,
    ContentEncoding: "base64",
    ContentType: encodeURI(`image/${imgType}`),
    ACL: "public-read",
  };

  s3.putObject(someParams, function (err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res
        .status(202)
        .send(
          `https://peak-blogspace-photobucket.s3.us-east-2.amazonaws.com/blog-images/${title}.${imgType}`
        );
    }
  });
}),
  (exports.uploadUserImg = async function (req, res) {
    const fileName = req.params.id1;
    const fileType = req.params.id2;
    const base64data = new Buffer.from(req.body.dataFile.data, "base64");

    aws.config.update({
      credentials: {
        accessKeyId: `${AWS_ACCESS_KEY}`,
        secretAccessKey: `${AWS_SECRET_KEY}`,
      },
      region: `${AWS_REGION}`,
    });

    const s3 = new aws.S3();
    const someParams = {
      Bucket: encodeURI(`${AWS_BUCKET}`),
      Key: encodeURI(`profile-pics/${fileName}.${fileType}`),
      Body: base64data,
      ContentEncoding: "base64",
      ContentType: encodeURI(`image/${fileType}`),
      ACL: "public-read",
    };

    s3.putObject(someParams, function (err) {
      if (err) {
        console.error(err, "find error here");
        res.status(400).send(err);
      } else {
        res
          .status(202)
          .send(
            `https://peak-blogspace-photobucket.s3.us-east-2.amazonaws.com/profile-pics/${fileName}.${fileType}`
          );
      }
    });
  }),
  // Controller funcs for Login/Signup
  (exports.createNewUser = async function (req, res) {
    const icon = req.body.userData.icon;
    const firstName = req.body.userData.firstName;
    const lastName = req.body.userData.lastName;
    const username = req.body.userData.username;
    const email = req.body.userData.email;
    const password = req.body.userData.password;
    const age = req.body.userData.age;
    const city = req.body.userData.city;
    const state = req.body.userData.state;
    const zipcode = req.body.userData.zip;
    const jobTitle = req.body.userData.jobTitle;
    const registerDate = req.body.userData.date;
    const passwordHashed = await argon2.hash(password);

    const newUserObj = async (stuffObj) => {
        const newObj = await stuffObj;
        const tokenToSend = generateJsonWebToken(newObj);
        console.log(newObj, tokenToSend, "this stuff")
          res.status(200).json({
          userData : newObj,
          sessToken : tokenToSend
        });
    }

    try {
        await mysqlQueries.createUser(icon, firstName, lastName, username, email, passwordHashed, age, city, state, zipcode, jobTitle, registerDate, newUserObj);
    }
    catch(error) {
      console.log(error);
      res.status(400).send(error);
    }
  }),
  (exports.addPrefTopics = async function (req, res) {
    const userId = req.params.id1;
    const userChoiceOne = req.body.topicData.choiceOne;
    const userChoiceTwo = req.body.topicData.choiceTwo;
    const userChoiceThree = req.body.topicData.choiceThree;
    const userChoiceFour = req.body.topicData.choiceFour;
    const userChoiceFive = req.body.topicData.choiceFive;

    try {
      await mysqlQueries.addPrefTopics(userId, userChoiceOne, userChoiceTwo, userChoiceThree, userChoiceFour, userChoiceFive);
      res.sendStatus(200);
    }catch(error){
      console.log(error);
      res.status(400).send(error);
    }
  }),
  (exports.authenticateUser = async function (req, res, next) {
    const username = req.params.id1;
    const password = req.params.id2;
    let userObj = null;

      const getUserObj = async (sqlUserData) => {
          userObj = await sqlUserData;
        const tokenToSend = generateJsonWebToken(userObj);
          res.status(200).json({
          userData : userObj,
          sessToken : tokenToSend
        });
      }

      try {
       await mysqlQueries.authUser(username, password, getUserObj);
        // next();
      } catch(err) {
        console.log(err)
        res.status(404).send(err);
      }
  }),
  (exports.deleteAccount = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  }),
  //
  // Controller funcs for Home page
  (exports.addPostView = async function (req, res) {
    const postId = req.params.id1;
    try{
    await mysqlQueries.addPostView(postId);
    res.sendStatus(200);
    }catch(err){
      res.status(400).send('Bad Request, Error Adding View');
    }
  }),
  //////////////////////
  (exports.getAllPosts = async function (req, res) {
    const sendBlogs = async (blogObj) => {
      if(blogObj.length === 0){
        res.sndStatus(405);
      } else {
      res.status(200).send(blogObj);
      }
    }
    try {
      await mysqlQueries.getPostData(sendBlogs);
    } catch(err) {
      console.log(err, "what error is dis");
        res.sendStatus(404);
    }
  }),
  //
  // Controller Funcs for Homepage/BlogOps Component
  (exports.addLike = async function (req, res) {
    const addOrRemoveLikes = req.params.id1;
    const postId = req.params.id2;
    const userId = req.params.id3;

    try {
      mysqlQueries.addSqlLike(addOrRemoveLikes, postId, userId);
      res.sendStatus(200);
    } catch (e) {
      console.log(e, "ERROR RIGHT HERE")
      res.sendStatus(404);
    }
  }),
  (exports.getLikedPosts = async function (req, res) {
    const userId = req.params.id1;

    const sendLikedPosts = (likedPosts) => {
      res.status(200).send(likedPosts);
    };

    try {
      mysqlQueries.addSqlLike('', 0, userId, sendLikedPosts);
    } catch(err) {
      res.sendStatus(404);
    }
  }),
  (exports.bookmarksForHome = async function (req, res) {
    const userId = req.params.id1;
    const sendToSite = (arr) => {
      if (arr.length === 0) {
        res.status(205).send("No bookmarks in arr");
      } else {
        res.status(200).send(arr);
      }
    };

    try{
      mysqlQueries.getUserBookmarks(userId, sendToSite);
    } catch (e) {
      res.sendStatus(404);
    }
  }),
  (exports.bookmarkNewPost = async function (req, res) {
    const postId = req.params.id1;
    const userId = req.params.id2;
    const cond = req.params.id3;

    const someCallback = async (bookmarkArr) => {
      console.log(bookmarkArr, "BOOKMARK ARRAY RIGHT HERE");
      try {
        await mysqlQueries.toggleBookmark(userId, postId, cond, bookmarkArr);
        res.sendStatus(200);
      } catch(e) {
        res.sendStatus(404);
      }
    }

    await mysqlQueries.getUserBookmarks(userId, someCallback);

  }),
  // Controller Funcs for IndepthBlogPage
  (exports.getAllInfoOnPost = async function (req, res) {
    // Post ID of requested blog page
    const requestId = req.params.id1;
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
            res.status(404).send(fail);
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
        `SELECT username, icon from account_info accInfo
        INNER JOIN user_posts posts ON posts.user_id = accInfo.id
        WHERE posts.id=${requestId} `,
        (error, results) => {
          if (error) {
            res
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
  (exports.postNewComment = async function (req, res) {
    const userId = req.params.id1;
    const postId = req.params.id2;
    const commentBody = req.body.data.commentBody;
    await connection.query(
      `INSERT INTO user_comments(user_id , post_id , comment_body  )
    VALUES( ${userId} , ${postId} , "${commentBody}")`,
      (error) => {
        if (error) {
          res.status(400).send("Failed to post comment");
        } else {
          res.status(200).send("Successfully posted new comment");
        }
      }
    );
  }),
  //
  // Controller Funcs for account page
  (exports.displayTopPosts = async function (req, res) {
    const userId = await req.params.id1;
    connection.query(
      `SELECT * FROM user_posts WHERE user_id=${userId} ORDER BY blog_likes DESC`,
      (error, results) => {
        if (error) {
          res
            .status(404)
            .send(
              "We're having some trouble loading this right now, please try again later"
            );
        } else {
          res.status(202).send(results);
        }
      }
    );
  }),
  (exports.displayTopComments = async function (req, res) {
    const userId = await req.params.id1;
    connection.query(
      `SELECT * FROM user_comments WHERE user_id=${userId}`,
      (error, results) => {
        if (error) {
          res
            .status(404)
            .send(
              "We're having some trouble loading this right now, please try again later"
            );
        } else {
          res.status(202).send(results);
        }
      }
    );
  }),
  (exports.fetchUserInfo = async function (req, res) {
    const userId = req.params.id1;
    await connection.query(
      `SELECT * FROM account_info WHERE id = ${userId}`,
      (error, results) => {
        if (error) {
          res.status(404).send(error);
        } else {
          let toSend = null;
          results.map((index) => {
            toSend = index;
          });
          console.log(toSend, "TO SEEEND")
          res.status(200).send(toSend);
        }
      }
    );
  }),
  //
  // Controller funcs for Navbar
  (exports.postNewBlog = async function (req, res) {
    const imgHeader = req.body.data.headerImg;
    const blogTitle = req.body.data.blogTitle;
    const blogBody = req.body.data.blogBody;
    const userIdToSend = req.body.data.userId;

    await connection.query(
      `INSERT INTO user_posts(user_id , post_title, post_body, blog_img, blog_likes) 
    VALUES( ${userIdToSend}, "${blogTitle}", "${blogBody}", "${imgHeader}", 0);`,
      (error, results) => {
        if (error) {
          console.log(error, "find me find me find me");
          res
            .status(404)
            .send(
              "There was an error posting your blog, please try again later."
            );
        } else {
          res.status(202).send(results);
        }
      }
    );
  }),
  //
  // Controller funcs for Bookmarks Page
  (exports.getBookmarkedPosts = async function (req, res) {
    const userId = req.params.id1;

    const sendPostData = (arrOfData) => {
      console.log(arrOfData, "for posttttttttt");
      res.status(200).send(arrOfData);
    }

    const getBMarkPostData = (arrOfId) => {
      try {
        mysqlQueries.getBMarkData(arrOfId, sendPostData);
      } catch(e) {
        console.log(e, 'ERROR GETTING BOOKMARKED POST DATA');
       res.sendStatus(404); 
      }
    }

    await mysqlQueries.getUserBookmarks(userId, getBMarkPostData);



  //   const blogObjArray = [];
  //   async function whatever(arr) {
  //     console.log(arr, 'ARRAY THAT MIGHT BE EMPTY')
  //     if(arr.length === 0){
  //       return res.status(200).send("Array is empty!");
  //     }else if (arr.indexOf('NaN') !== -1){
  //       return res.status(404).send("NaN is in bookmarks arr")
  //     }else if(arr.length !== 0){
  //     // let arrLength = arr.length;
  //     await arr.map(async (index) => {
  //       await connection.query(
  //         `SELECT user_posts.id , user_posts.post_title , user_posts.blog_img , user_posts.publish_date , account_info.username 
  //         FROM user_posts, account_info
  //         WHERE user_posts.id = ${index} AND account_info.id = user_posts.user_id`,
  //         async (error, results) => {
  //           if (error) {
  //             console.log(error , "probably error from sql!!!!")
  //             return res.status(400).send("Error getting data").t;
  //           } else {
  //             blogObjArray.push(...results);
  //           }
  //         }
  //       );
  //     });
  //     // if (blogObjArray.length !== arrLength) {
  //       setTimeout(async () => {
  //         return await res.status(200).send(blogObjArray);
  //       }, 2 * 250);
  //     // } else {
  //       // return await res.status(200).send(blogObjArray);
  //     // }
  //   }
  // }
  //   getUserBookmarks(userId, whatever);
  }),
  //

  // UNFINISHED ROUTES  ////////////////////////////////////////////////

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
