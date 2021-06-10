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
    WHERE id=${postId}`
      // (error) => {
      //   if (error) {
      //     res.status(400).send("Failed to update post views");
      //   } else {
      //     res.status(200).send("Successfully updated post views");
      //   }
      // }
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
      if(postIndex === -1){
        likesArr.push(`${postId}`);
          await connection.query(
              `UPDATE account_info SET liked_posts = '${likesArr}' WHERE id = ${userId}`,
              (err, results) => {
                if (err || results.changedRows === 0) {
                  throw err;
                } else {
                  return 'Success';
                }
              }
            );
      } else {
        throw 'USER ALREADY LIKED POST';
      }
    };

    const removeLike = async (likesArr) => {
      let postIndex = likesArr.indexOf(postId);
      if(postIndex === -1){
        throw 'ID OF POST TO REMOVE WAS NOT FOUND'
      } else {
        likesArr.splice(postIndex, 1);
        await connection.query(`UPDATE account_info SET liked_posts = '${likesArr}' WHERE id = ${userId}`, 
        (err , results) => {
          if(err || results.changedRows === 0){
            throw err;
          } else {
            return 'Success';
          }
        })
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
      (error, results) => {
        if (error) {
          throw error;
        } 
        else {
          var postsToFetch = results[0].bookmarked_posts;
          if (postsToFetch === null) {
            throw 'WAS NUUUUL';
          } 
          else {
            var newBookmarkArr = postsToFetch.split(",").map(Number);
            myCallback(newBookmarkArr);
          }
        }
      }
    );
  }),
  (exports.toggleBookmark = async function (userId, postId, cond, bookmarkArr) {
    let postIndex = bookmarkArr.indexOf(postId);
    console.log(cond, "conditional")
    if(`${cond}` === 'add'){
      if(postIndex === -1){
        bookmarkArr.push( `${postId}`);
          await connection.query(
              `UPDATE account_info SET bookmarked_posts = '${bookmarkArr}' WHERE id = ${userId}`,
              (err, results) => {
                if (err) {
                  throw `ERROR TOGGLING BOOKMARK`;
                } else {
                  return 'Success';
                }
              }
            );
      } else {
        throw 'USER ALREADY BOOKMARKED POST';
      }
    } else if(`${cond}` === 'remove'){
      if(postIndex === -1){
        throw 'ID OF POST TO REMOVE WAS NOT FOUND - BOOKMARK';
      } else {
        bookmarkArr.splice(postIndex, 1);
        await connection.query(`UPDATE account_info SET bookmarked_posts = '${bookmarkArr}' WHERE id = ${userId}`, 
        (err , results) => {
          if(err){
            throw err;
          } else {
            return 'Success';
          }
        })
      }
    }
  }),
  (exports.getBMarkData = async function (arr, cb) {
  const blogObjArray = [];
    if(arr.length === 0){
      throw 'ARR WAS EMPTY - GET BMARK POST DATA';
    } else {
      arr.map( async (index) => {
      await connection.query(
        `SELECT user_posts.id , user_posts.post_title , user_posts.blog_img , user_posts.publish_date , account_info.username 
        FROM user_posts, account_info
        WHERE user_posts.id = ${index} AND account_info.id = user_posts.user_id`,
        async (error, results) => {
          if (error) {
            throw error;
          } else {
            blogObjArray.push(...results);
            cb(blogObjArray)
          }
        }
      );
    })
    }

  })
