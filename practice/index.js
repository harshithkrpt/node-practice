const express = require("express");
const userRoute = require("./routes/user-route");
const cookieParser = require("cookie-parser");
const sigedCookie = require("./routes/signed-cookie");

// loading dotenv
require("dotenv").config();

// APP
const app = express();

app.use(cookieParser('verysecret-ket'))
app.use(express.static("public", ));


// parses incoming json
app.use(express.json());

// app.use((req, res, next) => {
//     console.log("Time For Req + " + req.url , Date.now());
//     next();
// });



app.use("/user", userRoute);
app.use("/signed-cookie", sigedCookie);

app.get("/", (req, res) => {
    res.status(200).send({
        message: "First Express Written on my own"
    });
});

app.post("/", (req, res) => {
    console.log(req);
    res.status(200).send({
        ...req.body
    });
})

app.get("/user/:userId/books/:booksId", (req, res) => {
    res.send({
        path: req.path,
        data: {
            userId: req.params.userId,
            bookId: req.params.booksId
        }
    });
});

app.get("/queryparams", (req, res) => {
    res.send({
        params: req.query
    })
});

app.listen(process.env.PORT, (error) => {
    if(!error) {
        console.log("Server started at port " + process.env.PORT);
    }
});
