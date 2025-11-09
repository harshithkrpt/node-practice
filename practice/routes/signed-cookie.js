const express = require("express");

const cookieParser = require("cookie-parser");

const router = express.Router();

// router.use(cookieParser("verysecretkey"));

router.get("/set-signed-cookie", (req, res) => {
    res.cookie("username", "harshithkurapati", {
        signed: true
    });

    res.send('cookie set');
});

router.get("/get-signed-cookie", (req, res) => {
    res.send({
        cookieStore: req.signedCookies,
        normalCookie: req.cookies
    });
});

router.get("/clear-cookie", (req, res) => {
    res.clearCookie('username');
    

    res.send("cleared the signed cookie");
});

module.exports = router;