const argon2 = require("argon2");
const mysql = require("mysql");
const aws = require("aws-sdk");
const jwt = require("jsonwebtoken");
const mysqlQueries = require("./sqlQueries");
const mysqlConfigObj = require("../sqlConfig");
const mysqlConfig = mysqlConfigObj.sqlConfig;

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
      throw (err, 'ERROR PUTTING BLOG IMG OBJ IN S3');
    } else {
      res
        .status(200)
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
        res.status(400).send(err);
        throw (err, 'ERROR PUTTING PROF OBJ IN S3');
      } else {
        res
          .status(200)
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
        console.log(newObj, tokenToSend, "this stuff");
          res.status(200).json({
          userData : newObj,
          sessToken : tokenToSend
        });
    }

    try {
        await mysqlQueries.createUser(icon, firstName, lastName, username, email, passwordHashed, age, city, state, zipcode, jobTitle, registerDate, newUserObj);
    }
    catch(error) {
      console.log(error, 'ERROR CREATING USER IN SQL');
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
      console.log(error, 'ERROR ADDING PREF TOPICS TO SQL');
      res.status(400).send(error);
    }
  }),
  (exports.authenticateUser = async function (req, res, next) {
    const username = req.params.id1;
    const password = req.params.id2;
    let userObj = null;

      const getUserObj = async (statusCode, sqlUserData) => {
        if(statusCode === 400){
          res.status(400).send('Incorrect username or password');
        } else {
          userObj = await sqlUserData;
        const tokenToSend = generateJsonWebToken(userObj);
          res.status(200).json({
          userData : userObj,
          sessToken : tokenToSend
        });
      }
      }

      try {
       await mysqlQueries.authUser(username, password, getUserObj);
      } catch(err) {
        console.log(err, 'ERROR AUTH USER');
        res.status(404).send(err);
      }
  }),
  (exports.deleteAccount = async function (req, res) {
    console.log("requuuuueeeest", req);
    console.log("respoooonnnssseee", res);
  }),
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

    const sendBookmarkArr = async (bookmarkArr) => {
      let bookmarkArrTwo = await bookmarkArr;
      try {
        await mysqlQueries.toggleBookmark(userId, postId, cond, bookmarkArrTwo);
        res.sendStatus(200);
      } catch(e) {
        console.log(e, 'ERROR FOR ADDING/REMOVING BOOKMARK FROM SQL');
        res.sendStatus(404);
      }
    }
const getBookmarkArr = async () => {
    await mysqlQueries.getUserBookmarks(userId, sendBookmarkArr);
}
getBookmarkArr();
  }),
  // Controller Funcs for IndepthBlogPage
  (exports.getAllInfoOnPost = async function (req, res) {
    const requestId = req.params.id1;
    const sendPostDetails = (allPostData) => {
      res.status(200).send(allPostData);
    };
    try {
      await mysqlQueries.getPostDetails(requestId, sendPostDetails);
    }catch(e) {
      res.sendStatus(404);
    }
  }),
  (exports.postNewComment = async function (req, res) {
    const userId = req.params.id1;
    const postId = req.params.id2;
    const commentBody = req.body.commentBody;

    try {
      await mysqlQueries.postNewComment(userId, postId, commentBody)
      res.sendStatus(200);
    } catch (e) {
      console.log(e, 'ERROR POSTING COMMENT ');
      res.sendStatus(404);
    }
  }),
  // Controller Funcs for account page
  (exports.displayTopPosts = async function (req, res) {
    const userId = req.params.id1;

    let cond = '';

    if(req.params.id2 === 'undefined'){
          cond = 'forAcc';
    } else {
      cond = 'forHome';
    }
      const sendUserPosts = (postData) => {
        res.status(200).send(postData);
      };

      try {
        mysqlQueries.displayTopPosts(userId, cond, sendUserPosts);
      } catch (e) {
        console.log(e, 'ERROR DISPLAYING TOP POSTS');
        res.sendStatus(404);
      };
  }),
  (exports.fetchUserInfo = async function (req, res) {
    const userId = req.params.id1;
    const sendUserData = (accountInfo) => {
      res.status(200).send(accountInfo);
    }
    try {
      mysqlQueries.fetchUserInfo(userId, sendUserData);
    } catch (e) {
      console.log(e, 'ERROR FETCHING USER DATA')
    }
  }),
  // Controller funcs for Navbar
  (exports.postNewBlog = async function (req, res) {
    const imgHeader = req.body.data.headerImg;
    const blogTitle = req.body.data.blogTitle;
    const blogBody = req.body.data.blogBody;
    const userId = req.body.data.userId;

 try {
   mysqlQueries.postNewBlog(imgHeader, blogTitle, blogBody, userId);
   res.sendStatus(200);
 } catch(e) {
   console.log(e, 'ERROR POSTING NEW BLOG');
   res.sendStatus(200);
 }
  }),
  //
  // Controller funcs for Bookmarks Page
  (exports.getBookmarkedPosts = async function (req, res) {
    const userId = req.params.id1;

    const sendPostData = (arrOfData) => {
        res.status(200).send(arrOfData);
    }

    const getBMarkPostData = async (arrOfId) => {
      try {
        await mysqlQueries.getBMarkData(arrOfId, sendPostData);
      } catch(e) {
        console.log(e, 'ERROR GETTING BOOKMARKED POST DATA');
       res.sendStatus(404); 
      }
    }

    await mysqlQueries.getUserBookmarks(userId, getBMarkPostData);
  }),
  //

  // UNFINISHED ROUTES  ////////////////////////////////////////////////

  (exports.deleteUserPost = async function (req, res) {
    await connection.query(`DELETE FROM user_posts WHERE id=${req.params.id1}`,
     (error, results) => {
      if (error) {
        return console.log(error);
      } else {
        console.log(results, "RESULTS OF REMOVING ACCOUNT");
        res.status(200).send(results);
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
