const jwt = require('jsonwebtoken');

const { JWT_SIGNATURE } = process.env;

(exports.authenticateToken = function (req, res, next) {
  console.log(req, "request for middleware");
  const authHeader = req.header('Authorization');
  if (authHeader == null) return res.sendStatus(401);
  jwt.verify(authHeader, JWT_SIGNATURE ,
     (err, pass) => {
      if(err){
        console.log(err, "error authenticating jwt");
      }else{
        console.log("Success!!! JWT authenticated" , pass);
      }
    next();
  });
})
