const express = require("express");
const bodyParser = require("body-parser");
// const cors = require("cors");
var routes = require("./routes/routes");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/' , (req , res) => {
    res.send("Welcome to Peak")
})

routes(app);




app.listen(PORT);

console.log(`server started on ${PORT}`);