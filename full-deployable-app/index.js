const express = require("express");
const { requireAuth } = require("./middlewares/auth")
const cookieParser = require("cookie-parser");
const { signToken } = require('./utils/auth')
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require('morgan');
require('dotenv').config();

const { mysqlPool } = require("./db/mysql");


const app = express();

const isProduction = process.env.NODE_ENV === 'production'

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(morgan(isProduction ? 'dev' : 'combined'));
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



app.post('/register', async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.firstName) {
        res.status(400).send({
            message: "Bad Request"
        });
    }
    const { username, password, firstName, lastName = "" } = req.body;

    let connection = await mysqlPool.getConnection();
    try {

        const dbUser = await connection.query("SELECT username FROM users WHERE username=? LIMIT 1", [username]);

        if (dbUser[0].length) {
            return res.status(400).send({
                message: "username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query("INSERT INTO users(username, password, first_name, last_name) VALUES(?,?,?,?);", [username, hashedPassword, firstName, lastName]);

        res.status(200).send({
            message: "User Inserted Successfully"
        });
    }
    catch (err) {
        res.status(500).send({
            message: "Something Went Wrong!"
        });
    }
    finally {
        connection.release();
    }
});

app.post("/login", async (req, res) => {
    if (!req?.body?.username || !req?.body?.password) {
        res.status(400).send({
            message: "bad request"
        });
        return;
    }

    const connection = await mysqlPool.getConnection();
    try {
        const [users] = await connection.query("SELECT username, password FROM users WHERE username = ? LIMIT 1", [req.body.username]);

        if (users.length === 0) {
            res.status(400).send({
                message: "user not found"
            });
            return;
        }

        const ok = await bcrypt.compare(req.body.password, users[0].password);
        if (!ok) {
            res.status(400).send({
                message: "invalid credentials"
            });
            return;
        }

        const token = signToken({ username: req.body.username });
        // if all ok set the cookie 
        res.cookie('token', token, cookieOptions)

        res.status(200).send({
            message: "user logged in"
        });
    }
    catch (err) {
        res.status(500).send({
            message: "something went wrong"
        });
    }
    finally {
        connection.release();
    }
});

// protected route
app.get("/profile", requireAuth, (req, res) => {
    res.send({
        response: {
            ...req.user
        }
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token", cookieOptions);
    res.send({
        message: "logout successful"
    });
});

// GET /static-user?username=harshithkurapati
app.get("/static-user", async (req, res) => {
  // default to "harshithkurapati" to make the endpoint static for benching
  const username = req.query.username || "harshithkurapati";

  // borrow a connection from pool
  let connection;
  try {
    connection = await mysqlPool.getConnection();

    // minimal query — just fetch username existence
    const [rows] = await connection.query(
      "SELECT username FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ found: false, username });
    }

    // return a tiny, stable JSON response ideal for benchmarking
    return res.status(200).json({ found: true, username: rows[0].username });
  } catch (err) {
    console.error("static-user error:", err);
    return res.status(500).json({ error: "internal_server_error" });
  } finally {
    // always release the connection back to pool
    if (connection) connection.release();
  }
});


app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.listen(process.env.PORT, (err) => {
    if (!err) {
        console.log(`Server Started at port ${process.env.PORT}`)
    }
});

