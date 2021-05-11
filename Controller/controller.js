const mysqlConfig = require("./mysqlConfig");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const cloudinary = require("cloudinary");
const fs = require("fs");

// const AWS = require('aws-sdk');
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const aws = require('aws-sdk');

const REGION = 'us-east-2';

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

const getUserBookmarks = async (userId, myCallback) => {
  await connection.query(
    `SELECT bookmarked_posts FROM account_info WHERE id=${userId}`,
    (error, results) => {
      if (error) {
        res.status(400).send('Problem with getting user bookmarks')
      } else {
        var postsToFetch = results[0].bookmarked_posts;
        if (postsToFetch === null) {
          return;
        } else {
          var newBookmarkArr = postsToFetch.split(",").map(Number);
          myCallback(newBookmarkArr);
        }
      }
    }
  );
};
// uploading images to cloudinary
(exports.uploadBlogImg = async function (req, res) {
  const title = req.params.id1;
  const noClue = req.body.data.fileURL;
  const base64data = new Buffer.from(req.body.data.fileURL, 'binary');

  aws.config.update({ 
    credentials : {accessKeyId: "AKIATKAJGQIM7TUK3SWG" , secretAccessKey: "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" }, 
    region: "us-east-2"
  })
  // const s3 = new S3Client({ credentials : {accessKeyId: 'AKIATKAJGQIM3AD2LUM5' , secretAccessKey: 'sNWnLTzjela3uRaKOGj53KqwuuEFXzRKwmT94xf' }, region : REGION , signingRegion : REGION});

  // const s3 = new aws.S3({apiVersion: "2012-10-17"});
  const s3 = new aws.S3();


  const someParams = {
    Bucket: encodeURI('peak-blogspace-photobucket'),
    Key : encodeURI(`/${title}.png`),
    Body : encodeURI(noClue)
    // Body : base64data,

    // ACL : 'public-read-write',
    // ContentEncoding: 'Buffer',
    // ContentType: `image/png`
  }

  console.log("Bucket : " + someParams.Bucket, "Body : " + someParams.Body );
  console.log(s3, "s3 what dis say?")

  // console.log(req.body.data.fileURL, "find me here here ")

  // await s3.getSignedUrl .upload(someParams, function (err, awsData){


     s3.putObject(someParams, function (err, awsData){
       if(err){
         console.log(err, "DIS WHEN IT  FAILS");
         res.status(469).send("failed" , err)
         throw err;
       }
       return res.status(200).send("SUCCESSFULLY SENT TO AWS RES" , awsData);
     })


  // const run = async () => {
  //   try {
  //     const data = await s3.send(new PutObjectCommand(someParams));
  //     console.log("Success", data);
  //   } catch (err) {
  //     console.log("Error", err);
  //   }
  // }
  // run();

}),
(exports.uploadUserImg = async function (req, res) {
  console.log(req, "request for upload USER img");
}),

// Controller funcs for Login/Signup
(exports.createNewUser = async function (req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const age = req.body.age;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zip;
  const jobTitle = req.body.jobTitle;
  const registerDate = req.body.date;
  await connection.query(`INSERT INTO account_info(first_name , last_name , username , email , password , age , city , state ,  zipcode , job_title , register_date) 
  VALUES("${firstName}" , "${lastName}" , "${username}" , "${email}" , "${password}" , ${age} , "${city}" , "${state}" , ${zipcode} , "${jobTitle}" , "${registerDate}" )`
  ,
     (error, results) => {
    if (error) {
      res.status(404).send(error);
    } else if (results.length === 0) {
      res.status(400).send("Please try again");
    } else if (results.length !== 0) {
      res.status(200).send(results);
    }
  });
}),
(exports.addPrefTopics = async function (req, res) {
  const userId = req.params.id1;
  const userChoiceOne = req.body.choiceOne;
  const userChoiceTwo = req.body.choiceTwo;
  const userChoiceThree = req.body.choiceThree;
  const userChoiceFour = req.body.choiceFour;
  const userChoiceFive = req.body.choiceFive;

  // console.log(userChoiceOne , userChoiceTwo , userChoiceThree , userChoiceFour , userChoiceFive);

  await connection.query(`UPDATE account_info SET preferred_topics = '${userChoiceOne}, ${userChoiceTwo}, ${userChoiceThree}, ${userChoiceFour}, ${userChoiceFive}' WHERE id=${userId}`,
    (error , response) => {
      if(error){
        console.log(error);
        res.status(400).send(error);
      }else{
        console.log(response, "response to add topics");
        res.status(200).send(response);
      }
    });
}),
  (exports.authenticateUser = async function (req, res) {
    const username = req.params.id1;
    const password = req.params.id2;
    await connection.query(`SELECT * FROM account_info WHERE username = '${username}' AND password = '${password}'`,
     (error, results) => {
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
  (exports.deleteAccount = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  }),
  //
  // Controller funcs for Home page
  (exports.addPostView = async function (req, res) {
    const postId = req.params.id1;
    await connection.query(
      `UPDATE user_posts 
    SET post_views = post_views + 1 
    WHERE id=${postId}`,
      (error) => {
        if (error) {
          res.status(400).send("Failed to update post views");
        } else {
          res.status(200).send("Successfully updated post views");
        }
      }
    );
  }),
  (exports.getAllPosts = async function (req, res) {
    await connection.query( 
      `SELECT user_posts.id , user_posts.user_id , user_posts.post_title , user_posts.post_body , user_posts.blog_img , user_posts.post_views , user_posts.blog_likes , user_posts.publish_date , account_info.username
    FROM user_posts, account_info
    WHERE user_posts.user_id = account_info.id`,
     async (error, results) => {
      if (error) {
        return console.log(error);
      } else if (results.length === 0) {
        res.status(404).send(error);
      } else {
        res.status(200).send(results);
      }
    });
  }),
  //
  // Controller Funcs for Homepage/BlogOps Component
  (exports.addLike = async function (req, res) {
    const numOflikesToAdd = req.params.id1;
    const postId = req.params.id2;
    const postTitle = req.params.id3;
    connection.query(`UPDATE user_posts SET blog_likes=${numOflikesToAdd} WHERE id=${postId} AND post_title="${postTitle}"`,
     (error, results) => {
      if (error) {
        res.status(400).send(error);
      } else if (results.length === 0) {
        res.status(404).send(error);
      } else {
        res.status(200).send(results);
      }
    });
  }),
  (exports.getLikedPosts = async function (req, res) {
    const userId = req.params.id1;
    await connection.query(
      `SELECT account_info.liked_posts FROM account_info WHERE id=${userId}`,
      (error, results) => {
        if (error) {
          res.status(400).send("error loading posts");
        } else if (results.length === 0) {
          res.status(404).send(error);
        } else {
          let likedPosts = results[0].liked_posts;
          if (likedPosts === null) {
            res
              .status(400)
              .send("Error loading your likes array, please refresh");
          } else {
            let likesArr = likedPosts.split(",").map(Number);
            res.status(200).send(likesArr);
          }
        }
      });
  }),
  (exports.bookmarksForHome = async function (req, res) {
    const userId = req.params.id1;
    const sendToSite = (arr) => {
      if (arr.length === 0) {
        res.status(205).send("No bookmarks in arr");
      } else {
        res.status(200).send(arr);
      }
    }
    getUserBookmarks(userId, sendToSite);
  }),
  (exports.bookmarkNewPost = async function (req, res) {
    const bookmarkedPostId = req.params.id1;
    const userId = req.params.id2;
    let finalArr = [];
    const insertNewBookmark = async (arr) => {
      let strToMatch = arr.toString();
      if (strToMatch.indexOf(bookmarkedPostId) === -1) {
        finalArr = `${arr},${bookmarkedPostId}`;
        await connection.query(
          `UPDATE account_info SET bookmarked_posts = "${finalArr}"
          WHERE id = ${userId}`,
          (error) => {
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
      }
    };
    getUserBookmarks(userId, insertNewBookmark);
  }),
  (exports.removeBookmarkedPost = async function (req, res) {
    const postId = req.params.id1;
    const userId = req.params.id2;
    const uniqueArray = [];
    const deleteBookmark = async (arr) => {
      var index = arr.indexOf(postId);
      if (index === -1) {
        arr.splice(index, 1);
        uniqueArray = await arr.toString();
        await connection.query(
          `UPDATE account_info SET bookmarked_posts = "${uniqueArray}"
                        WHERE id = ${userId}`,
          async (error) => {
            if (error) {
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
  //
  // Controller Funcs for IndepthBlogPage
  (exports.getAllInfoOnPost = async function (req, res) {
    // Post ID of requested blog page
    const requestId = req.params.id1;
    // Array to store results from each query
    const allInfoArr = [];
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
  (exports.postNewComment = async function (req, res) {
    const userId = req.params.id1;
    const postId = req.params.id2;
    const commentBody = req.params.id3;
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
    connection.query(`SELECT * FROM user_posts WHERE user_id=${userId} ORDER BY blog_likes DESC`,
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
    });
  }),
  (exports.displayTopComments = async function (req, res) {
    const userId = await req.params.id1;
    connection.query(`SELECT * FROM user_comments WHERE user_id=${userId}`,
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
    });
  }),
  (exports.fetchUserInfo = async function (req, res) {
    const userId = await req.params.id1;
    connection.query(`SELECT * FROM account_info WHERE id = ${userId}`,
     (error, results) => {
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
  //
  // Controller funcs for Navbar
  (exports.postNewBlog = async function (req, res) {
    const imgHeader = req.body.blogInfoToSend.imgHeaderToSend;
    const blogTitle = req.body.blogInfoToSend.blogTitleToSend;
    const blogBody = req.body.blogInfoToSend.blogBodyToSend;
    const userIdToSend = req.body.blogInfoToSend.userIdToSend;
    await connection.query(`INSERT INTO user_posts(user_id , post_title, post_body, blog_img, blog_likes) 
    VALUES("${userIdToSend}", "${blogTitle}", "${blogBody}", "${imgHeader}", 0);`,
     (error, results) => {
      if (error) {
        res
          .status(404)
          .send(
            "There was an error posting your blog, please try again later."
          );
      } else {
        res.status(202).send(results);
      }
    });
  }),
  //
  // Controller funcs for Bookmarks Page
  (exports.getBookmarkedPosts = async function (req, res) {
    const userId = req.params.id1;
    const blogObjArray = [];
    async function whatever(arr) {
      let arrLength = arr.length;
      await arr.map(async (index) => {
        await connection.query(
          `SELECT user_posts.id , user_posts.post_title , user_posts.blog_img , user_posts.publish_date , account_info.username 
          FROM user_posts, account_info
          WHERE user_posts.id = ${index} AND account_info.id = user_posts.user_id`,
          async (error, results) => {
            if (error) {
              return res.status(400).send("Error getting data").t;
            } else {
              blogObjArray.push(...results);
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
