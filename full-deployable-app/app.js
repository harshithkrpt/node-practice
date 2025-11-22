// 3rd party packages
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require('morgan');
const session = require("express-session");
const passport = require("passport");

// dot env
require('dotenv').config();

const { isProduction  } = require("./utils/common");

const authRoute = require("./routes/auth")
const fileUploadRoute = require("./routes/fileupload");
const sitesRoute = require('./routes/sites');
const crawlRoute = require('./routes/crawl');
const app = express();
const { setupPassport } = require("./utils/passport-config");

// middlewares
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

// in production use a store like Redis
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction()
    }
}));

app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport)

app.use(morgan(!isProduction() ? 'dev' : 'combined'));
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_CORS,
    credentials: true
}));


// routes
app.use("/auth", authRoute);
app.use("/file", fileUploadRoute);
app.use("/sites", sitesRoute);
app.use('/crawl', crawlRoute);

app.get("/", authRoute , (req, res) => {
    res.send({...req.user})
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});



module.exports = app;