const jwt = require('jsonwebtoken');


const { JWT_SIGNATURE } = process.env;

(exports.authenticateToken = function (req, res, next) {
  console.log(req.rawHeaders.Authorization, "request here logan!!!")
  console.log(req.rawHeaders, "request here TOOOOOO logan!!!")
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, JWT_SIGNATURE ,
     (err, pass) => {
      if(err){
        console.log(err, "error authenticating jwt");
      }else{
        console.log("Success!!! JWT authenticated" , pass);
      }
    next();
  });
})
