const express = require("express");
const {requireAuth} = require("./middlewares/auth")
const cookieParser = require("cookie-parser");
const {signToken} = require('./utils/auth')
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require('morgan');

require('dotenv').config();

const app = express();

const isProduction = process.env.NODE_ENV === 'production'

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(morgan(isProduction ? 'dev': 'combined'));
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_CORS,
    credentials: true
}));

const cookieOptions = {
    maxAge: 15 * 60 * 1000, // 15 min
    secure: isProduction,
    signed: true,
    sameSite: 'lax',
    httpOnly: true
};



const users = [
    {
        username: "harshithkurapati",
        password: bcrypt.hashSync('harshith123', 10)
    }
];

app.post("/login", async (req, res) => {
    if(!req?.body?.username || !req?.body?.password) {
        res.status(400).send({
            message: "bad request"
        })
        return;
    }

    const userInfo = users.find(user => user.username === req.body.username);
    if(!userInfo) {
        res.status(400).send({
            message: "user not found"
        });
        return;
    }

    const ok = await bcrypt.compare(req.body.password, userInfo.password);
    if(!ok) {
         res.status(400).send({
            message: "invalid credentials"
        });
        return;
    }
    const token = signToken({username: req.body.username});
    // if all ok set the cookie 
    res.cookie('token', token, cookieOptions)

    res.status(200).send({
        message: "user logged in"
    });
});

// protected route
app.get("/profile", requireAuth, (req, res) => {
    res.send({
        response: {
            ...req.user
        }
    });
});

app.get("/logout", (req,res) => {
    res.clearCookie("token", cookieOptions);
    res.send({
        message: "logout successful"
    });
});

app.listen(process.env.PORT, (err) => {
    if(!err) {
        console.log(`Server Started at port ${process.env.PORT}`)
    }
});