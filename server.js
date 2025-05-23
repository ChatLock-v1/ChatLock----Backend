const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")





const app = express()
app.use(cors())

// port no. for server run
const PORT = 3000

// pass data from the form
// .............................
app.use(bodyParser.urlencoded({ extended: true }));

// middleware Passing Incoming Data
// .......................................
app.use(bodyParser.json());


// here all the routes which is needed 
// for example  1 chat, 2 social 









// server listen
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})