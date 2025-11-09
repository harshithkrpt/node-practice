const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
require('dotenv').config();

const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

const cookieOptions = {
    maxAge: 15 * 60 * 1000, // 15 min
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'lax',
    httpOnly: true
};


// util methods

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
}

const verifyToken = (token, opts = {}) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, opts);
    }
    catch(err) {
        return null;
    }
}

const requireAuth = (req, res, next) => {
    if(!req.signedCookies.token) {
        res.status(401).send({message: "invalid token"});
        return;
    }
    const token = req.signedCookies.token;
    const payload = verifyToken(token);
    if(!payload) {res.status(401).send({message: "invalid token"});
 return;}
   
    req.user = payload;
    next();
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