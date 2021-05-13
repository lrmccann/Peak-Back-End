const jwt = require('jsonwebtoken');

const { JWT_SIGNATURE } = process.env;

(exports.authenticateToken = function (req, res, next) {
  // console.log(req.headers, "HEADERSSSSSSSSSSSSS");
  // console.log(req.rawHeaders, "RAWWWWHEADDEERRSSSS")
  const authHeader = req.header('Authorization');
  console.log(authHeader, "OLD AUTH HEADER")
  // if (authHeader == null) return res.sendStatus(401);
  if(authHeader == null){
    let newAuthHeader = req.header('authorization');
    console.log(newAuthHeader, "NEW AUTH HEADERS")
    jwt.verify(newAuthHeader, JWT_SIGNATURE ,
      (err, pass) => {
       if(err){
         console.log(err, "error authenticating jwt IN 2");
       }else{
         console.log("Success!!! JWT authenticated IN 2" , pass);
       }
     next();
   });
  }else{
  jwt.verify(authHeader, JWT_SIGNATURE ,
     (err, pass) => {
      if(err){
        console.log(err, "error authenticating jwt");
      }else{
        console.log("Success!!! JWT authenticated" , pass);
      }
    next();
  });
}
})
