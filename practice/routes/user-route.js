const express = require("express");

const router = express.Router();


// add a logger 
router.use((req, _, next) => {
    console.log(`${req.method} at ${Date.now()}`);
    next();
});


router.get("/", (req, res) => {
    res.status(200).json({
        user: "harshith kurapati"
    });
});


router.get("/set-cookie", (req, res) => {
    res.cookie("username", "harshith", {
        maxAge: 60 * 1000 // 1 min
    });

    res.send("cookie has ben sent");
});

router.get("/get-cookie", (req, res) => {
    console.log(req.cookies); // logs: { username: 'harshith' }
  res.send(`Hello ${req.cookies.username}`);
})

router.get("/clear-cookie", (req, res) => {
    res.clearCookie('username');
    res.send("response send");
});


module.exports = router;

