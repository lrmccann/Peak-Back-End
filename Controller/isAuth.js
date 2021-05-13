const jwt = require('jsonwebtoken');


const { JWT_SIGNATURE } = process.env;

(exports.authenticateToken = function (req, res, next) {
  // console.log(req, "request here logan!!!")
  // const authHeader = req.rawHeaders.find( ({ authToken }) => authToken === 'Authorization' );
  const authHeader = req.header('Authorization');
  console.log(authHeader, "LOGAN HERE HERE")
  // const token = authHeader && authHeader.split(' ')[1]
  // console.log(token, "ALSO HERE LOGAN HERE")

  if (authHeader == null) return res.sendStatus(401)

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
