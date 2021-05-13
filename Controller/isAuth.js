const jwt = require('jsonwebtoken');

const { JWT_SIGNATURE } = process.env;

(exports.authenticateToken = function (req, res, next) {
  // console.log(req.headers, "HEADERSSSSSSSSSSSSS");
  // console.log(req.rawHeaders, "RAWWWWHEADDEERRSSSS")
  const authHeader = req.header('Authorization');
  console.log(authHeader, "OLD AUTH HEADER")

  jwt.verify(authHeader, JWT_SIGNATURE ,
     (err, pass) => {
      if(err){
            let newAuthHeader = req.header('authorization');
              console.log(newAuthHeader, "NEW AUTH HEADERS");
              jwt.verify(newAuthHeader, JWT_SIGNATURE ,
                (err, pass) => {
                 if(err){
                   console.log(err, "error authenticating jwt IN 2");
                   res.status(400).send("FAILED");
                 }else{
                   console.log("Success!!! JWT authenticated IN 2" , pass);
                   res.status(200).send("PASSED SECOND TIME");
                 }
               next();
             });
      }else{
        console.log("Success!!! JWT authenticated" , pass);
        res.status(200).send("PASSED FIRST TIME")
      }
    next();
  });
}
// }
)
