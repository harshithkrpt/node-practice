const express = require("express");
const userRoute = require("./routes/user-route");
const cookieParser = require("cookie-parser");
const sigedCookie = require("./routes/signed-cookie");

// loading dotenv
require("dotenv").config();

// APP
const app = express();

app.use(cookieParser('verysecret-ket'))
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

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

const arrayOfMiddleWares = [(req, res, next) => {
    console.log(req.originalUrl);

    next();
}, (req, res, next) => {
    console.log(req.method);
    next()
}];

app.get('/user/:id', arrayOfMiddleWares, (req, res, next) => {
  // if the user ID is 0, skip to the next route
  if (req.params.id === '0') next('route')
  // otherwise pass the control to the next middleware function in this stack
  else next()
}, (req, res, next) => {
  // send a regular response
  res.send('regular')
})

// handler for the /user/:id path, which sends a special response
app.get('/user/:id', (req, res, next) => {
  res.send('special')
})



// Normal route
app.get("/error", (req, res) => {
  throw new Error("Something went wrong!"); // Simulating an error
});


// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ message: "Internal Server Error" });
});


// custom errors

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

app.get("/secret", (req, res, next) => {
  next(new ApiError(403, "Forbidden: Access denied"));
});


app.post("/encode", (req, res) => {
    console.log(req.body);
    res.send(200);
});

app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "Something went wrong" : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
});



app.listen(process.env.PORT, (error) => {
    if(!error) {
        console.log("Server started at port " + process.env.PORT);
    }
});
