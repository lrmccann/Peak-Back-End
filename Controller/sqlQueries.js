const mysql = require("mysql");
const mysqlConfigObj = require("../sqlConfig");
const mysqlConfig = mysqlConfigObj.sqlConfig;
const argon2 = require("argon2");

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

function createObjForComments(username, commentBody, commentRank, joinDate) {
  this.username = username;
  this.commentBody = commentBody;
  this.commentRank = commentRank;
  this.joinDate = joinDate;
}

function createObjForHome(postTitle, commentRank, joinDate) {
  this.username = username;
  this.commentBody = commentBody;
  this.commentRank = commentRank;
  this.joinDate = joinDate;
}

(exports.createUser = async function (
  icon,
  firstName,
  lastName,
  username,
  email,
  passwordHashed,
  age,
  city,
  state,
  zipcode,
  jobTitle,
  registerDate,
  callback
) {
  await connection.query(
    `INSERT INTO account_info(icon , first_name , last_name , username , email , password , age , city , state ,  zipcode , job_title , register_date) 
    VALUES( "${icon}" , "${firstName}" , "${lastName}" , "${username}" , "${email}" , "${passwordHashed}" , ${age} , "${city}" , "${state}" , ${zipcode} , "${jobTitle}" , "${registerDate}" )`,
    async (error, results) => {
      if (error) {
        throw error;
      } else if (results.length !== 0) {
        let userObj = {
          id: results.insertId,
          lastName: lastName,
          email: email,
        };
        return callback(userObj);
      }
    }
  );
}),
  (exports.addPrefTopics = async function (
    userId,
    userChoiceOne,
    userChoiceTwo,
    userChoiceThree,
    userChoiceFour,
    userChoiceFive
  ) {
    await connection.query(
      `UPDATE account_info SET preferred_topics = '${userChoiceOne}, ${userChoiceTwo}, ${userChoiceThree}, ${userChoiceFour}, ${userChoiceFive}' WHERE id=${userId}`,
      (error) => {
        if (error) {
          throw error;
        } else {
          return "Success";
        }
      }
    );
  }),
  (exports.authUser = async function (username, password, cb) {
    const getAllUserData = async (userEmail) => {
      await connection.query(
        `SELECT id , icon , first_name , last_name , username , email , age , city , state ,  zipcode , job_title , register_date , preferred_topics
          FROM account_info
          WHERE email = '${userEmail}'`,
        (error, results) => {
          if (error) {
            throw error;
          } else {
            results.map(async (index) => {
              return await cb(index);
            });
          }
        }
      );
    };
    const verifyPassword = async () => {
      await connection.query(
        `SELECT email , password FROM account_info WHERE username = '${username}'`,
        async (error, results) => {
          if (error) {
            throw error;
          } else if (results.length !== 0) {
            if (await argon2.verify(results[0].password, password)) {
              getAllUserData(results[0].email);
            } else {
              throw "Username and Password do not match";
            }
          }
        }
      );
    };
    verifyPassword();
  }),
  (exports.addPostView = async function (postId) {
    await connection.query(
      `UPDATE user_posts 
    SET post_views = post_views + 1 
    WHERE id=${postId}`,
      (err, data) => {
        if (err) {
          throw err;
        } else {
          return data;
        }
      }
    );
  }),
  (exports.getPostData = async function (cb) {
    await connection.query(
      `SELECT user_posts.id , user_posts.user_id , user_posts.post_title , user_posts.post_body , user_posts.blog_img , user_posts.post_views , user_posts.blog_likes , user_posts.publish_date , account_info.username , account_info.icon
      FROM user_posts, account_info
      WHERE user_posts.user_id = account_info.id`,
      (error, results) => {
        if (error) {
          throw error;
        } else {
          cb(results);
        }
      }
    );
  }),
  (exports.addSqlLike = async function (cond, postId, userId, cb) {
    const addLike = async (likesArr) => {
      let postIndex = likesArr.indexOf(postId);
      if (postIndex === -1) {
        likesArr.push(`${postId}`);
        await connection.query(
          `UPDATE account_info SET liked_posts = '${likesArr}' WHERE id = ${userId}`,
          (err, results) => {
            if (err || results.changedRows === 0) {
              throw err;
            } else {
              return "Success";
            }
          }
        );
      } else {
        throw "USER ALREADY LIKED POST";
      }
    };

    const removeLike = async (likesArr) => {
      let postIndex = likesArr.indexOf(postId);
      if (postIndex === -1) {
        throw "ID OF POST TO REMOVE WAS NOT FOUND";
      } else {
        likesArr.splice(postIndex, 1);
        await connection.query(
          `UPDATE account_info SET liked_posts = '${likesArr}' WHERE id = ${userId}`,
          (err, results) => {
            if (err || results.changedRows === 0) {
              throw err;
            } else {
              return "Success";
            }
          }
        );
      }
    };

    const getLikesArr = async () => {
      await connection.query(
        `SELECT liked_posts FROM account_info WHERE id = ${userId}`,
        (err, results) => {
          if (err) {
            console.log(err, "ADD LIKE SQL ERROR FIRST QUERY");
            throw err;
          } else if (results.length <= 0) {
            throw "Likes Arr is empty, send status code and handle on front end";
          } else {
            let likesArr = results[0].liked_posts.split(",");
            if (cond === "add") {
              addLike(likesArr);
            } else if (cond === "remove") {
              removeLike(likesArr);
            } else {
              let likesArrMap = results[0].liked_posts.split(",").map(Number);
              cb(likesArrMap);
            }
          }
        }
      );
    };
    getLikesArr();
  }),
  (exports.getUserBookmarks = async (userId, myCallback) => {
    await connection.query(
      `SELECT bookmarked_posts FROM account_info WHERE id=${userId}`,
      async (error, results) => {
        if (error) {
          throw error;
        } else {
          console.log(results, 'RESULTS FOR GET USER BOOKMARKS');
          // var postsToFetch = results[0].bookmarked_posts;
          // if (postsToFetch === null) {
          //   console.log('was NUUUUUULLL');
          // } else {
            var newBookmarkArr = await results[0].bookmarked_posts.split(",").map(Number);
            console.log(newBookmarkArr, 'NEW BOOOOOOKMARK ARRR');
            myCallback(newBookmarkArr);
          }
        }
      // }
    );
  }),
  (exports.toggleBookmark = async function (userId, postId, cond, bookmarkArr) {
    // console.log(bookmarkArr, 'BOOOOKMARK ARRRRAY')
    // console.log(postId, 'PSOT ID')
    if (`${cond}` === "add") {
    const addBoomark = async () => {
      let postIndex = bookmarkArr.indexOf(postId);
      if (postIndex === -1) {
        bookmarkArr.push(`${postId}`);
        await connection.query(
          `UPDATE account_info SET bookmarked_posts = '${bookmarkArr}' WHERE id = ${userId}`,
          (err, results) => {
            if (err) {
              throw `ERROR TOGGLING BOOKMARK`;
            } else {
              return results;
            }
          }
        );
      } else {
        throw "USER ALREADY BOOKMARKED POST";
      }
    }
    addBoomark();
  }
    else if (`${cond}` === "remove") {
    const removeBookmark = async () => {
      console.log(bookmarkArr, 'MMMMHHHHMMM');
      console.log(postId, 'POST ID AGAIN')
      let postIndex = bookmarkArr.indexOf(postId);
      // if (postIndex === -1) {
        console.log(postIndex, 'POST INDEXXXXX')
      if (postIndex !== -1) {
        return 'whatever';
      } else {
        bookmarkArr.splice(postIndex, 1);
        console.log(bookmarkArr.splice(postIndex, 1), 'THIS LOGAN');
        console.log(bookmarkArr, 'AGAIN')
        console.log(bookmarkArr, 'AFTEER SPLICE')
        await connection.query(
          `UPDATE account_info SET bookmarked_posts = '${bookmarkArr}' WHERE id = ${userId}`,
          (err, results) => {
            if (err) {
              throw err;
            } else {
              return results;
            }
          }
        );
      }
    }
    removeBookmark();
    }
    // console.log(cond, "conditional");
    // if (`${cond}` === "add") {
    //   addBoomark();
    // } else if (`${cond}` === "remove") {
    //   removeBookmark();
    // }
  }),
  (exports.getBMarkData = async function (arr, cb) {
    const blogObjArray = [];
    if (arr.length === 0) {
      throw "ARR WAS EMPTY - GET BMARK POST DATA";
    } else {
      await arr.map(async (index) => {
        await connection.query(
          `SELECT user_posts.id , user_posts.post_title , user_posts.blog_img , user_posts.publish_date , account_info.username 
        FROM user_posts, account_info
        WHERE user_posts.id = ${index} AND account_info.id = user_posts.user_id`,
          (error, results) => {
            if (error) {
              throw error;
            } else {
              blogObjArray.push(...results);
              if (Object.keys(blogObjArray).length === arr.length) {
                cb(blogObjArray);
              }
            }
          }
        );
      });
    }
  }),
  (exports.getPostDetails = async function (requestId, cb) {
    let allInfoArr = [];
    const getCommentData = async () => {
      await connection.query(
        `SELECT * FROM user_posts posts
          INNER JOIN user_comments comments ON posts.id = comments.post_id
          INNER JOIN account_info accInfo ON comments.user_id = accInfo.id
          WHERE posts.id=${requestId}`,
        (error, results) => {
          if (error) {
            throw error;
          } else {
            results.map((index) => {
              var commentObj = new createObjForComments(
                `${index.username}`,
                `${index.comment_body}`,
                `${index.comment_rank}`,
                `${index.register_date}`
              );
              allInfoArr.push(commentObj);
            });
            cb(allInfoArr);
          }
        }
      );
    };
    // Gets Blog body, # of likes, etc. Sends response to web page
    const getBlogDetails = async () => {
      await connection.query(
        `SELECT post_title, post_body, blog_img, post_views, blog_likes, publish_date FROM user_posts WHERE user_posts.id=${requestId}`,
        (err, results) => {
          if (err) {
            throw err;
          } else {
            allInfoArr.push(results[0]);
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
        (e, results) => {
          if (e) {
            throw e;
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
  (exports.postNewComment = async function (userId, postId, commentBody) {
    await connection.query(
      `INSERT INTO user_comments(user_id , post_id , comment_body)
    VALUES( ${userId} , ${postId} , "${commentBody}")`,
      (error, res) => {
        if (error) {
          res.sendStatus(404);
          throw error;
        } else {
          return res;
        }
      }
    );
  }),
  (exports.displayTopPosts = async function (userId, cond, cb) {
    if(cond === 'forAcc'){
    await connection.query(
      `SELECT * FROM user_posts WHERE user_id=${userId} ORDER BY blog_likes DESC`,
      (error, results) => {
        if (error) {
          throw error;
        } else {
          cb(results);
        }
      }
    );
    } else if(cond === 'forHome'){
      await connection.query(
        `SELECT id, user_id, blog_img, post_title, post_views, publish_date FROM user_posts ORDER BY post_views DESC LIMIT 5`,
        (error, results) => {
          if (error) {
            throw error;
          } else {
            cb(results);
          }
        }
      );
    }
  }),
  (exports.fetchUserInfo = async function (userId, cb) {
    await connection.query(
      `SELECT * FROM account_info WHERE id = ${userId}`,
      (error, results) => {
        if (error) {
          res.status(404).send(error);
        } else {
          let userData = null;
          results.map((index) => {
            userData = index;
          });
          cb(userData);
        }
      }
    );
  }),
  (exports.postNewBlog = async function (imgHeader, blogTitle, blogBody, userId) {
    await connection.query(
      `INSERT INTO user_posts(user_id , post_title, post_body, blog_img, blog_likes) 
    VALUES( ${userId}, "${blogTitle}", "${blogBody}", "${imgHeader}", 0);`,
      (error, results) => {
        if (error) {
          throw error;
        } else {
          return results;
        }
      }
    );
  })
