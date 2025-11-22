const { Router } = require('express');
const { mysqlPool } = require("../db/mysql");
const bcrypt = require("bcrypt");
const { signAccessToken, generateRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
  storeRefreshToken, } = require("../utils/auth.js");
const router = Router();
const { requireAuth } = require("../middlewares/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { getUserService, insertUserService } = require("../services/userService");
const {insertRoleService, getUserIdRoles} = require('../services/roleService');

router.post('/register', async (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.firstName) {
    res.status(400).send({
      message: "Bad Request"
    });
  }
  const { username, password, firstName, lastName = "" } = req.body;

  let connection = await mysqlPool.getConnection();
  try {

    const dbUser = await getUserService(connection, username);
    if (dbUser[0].length) {
      return res.status(400).send({
        message: "username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const row = await insertUserService(connection, {
      username,
      password: hashedPassword,
      firstName, 
      lastName
    });

    if(row.length) {
       const userId = row[0].insertId;
       await insertRoleService(connection, {
          userId,
          roleName: 'REQUESTOR'
       });
    }
    else {
      throw new Error("Cannot Insert the Role");
    }
   

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

router.post("/login", async (req, res) => {
  if (!req?.body?.username || !req?.body?.password) {
    res.status(400).send({
      message: "bad request"
    });
    return;
  }

  const connection = await mysqlPool.getConnection();
  try {
    const [users] = await getUserService(connection, req.body.username, true);

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

    const rolesRes = await getUserIdRoles(connection, users[0].user_id);
    let roles = [];
    if(rolesRes.length) {
      roles = rolesRes[0].map(r => r['role_name']);
    }

    const accessToken = signAccessToken({ username: req.body.username, sub: users[0].user_id, roles });

    const { jti, token: refreshToken } = generateRefreshToken({
      id: users[0].user_id,
      username: req.body.username
    });

    const decoded = jwt.decode(refreshToken);
    const expSeconds = decoded.exp - decoded.iat;

    await storeRefreshToken(users[0].user_id, jti, expSeconds);

    // res.cookie('token', token, getCookieOptions())

    res.status(200).json({
      message: "user logged in",
      accessToken,
      refreshToken
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({
      message: "something went wrong"
    });
  }
  finally {
    connection.release();
  }
});

// protected route
router.get("/profile", requireAuth, (req, res) => {
  res.send({
    response: {
      ...req.user
    }
  });
});

router.post("/logout", (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, payload) => {
      if (err) {
        return res.status(200).json({ message: "Logged out" }); // already invalid
      }

      await revokeRefreshToken(payload.sub, payload.jti);

      res.status(200).json({ message: "Logged out" });
    }
  );
});


router.get("/getuser", requireAuth, async (req, res) => {
  const username = req.query.username;

  // borrow a connection from pool
  let connection;
  try {
    connection = await mysqlPool.getConnection();

    // minimal query — just fetch username existence
    const [rows] = await getUserService(connection, username);

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

// router.get("/google", passport.authenticate('google', {
//   scope: ['profile', 'email']
// }));


// // callback url
// router.get("/google/callback", passport.authenticate('google', {
//   failureRedirect: '/',
// }), (req, res) => {
//   res.redirect("/");
// });



router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }
  let connection = await mysqlPool.getConnection();
  try {
      jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }

      const sub = payload.sub;
      const jti = payload.jti;

      const valid = await isRefreshTokenValid(sub, jti);
      if (!valid) {
        return res.status(401).json({ message: "Refresh token revoked" });
      }

      // ROTATE refresh token (best practice)
      await revokeRefreshToken(sub, jti);
      const rolesRes = await getUserIdRoles(connection, sub);
      let roles = [];
      if(rolesRes.length) {
        roles = rolesRes[0].map(r => r['role_name']);
      } 
      const user = { sub, username: payload.username, roles }; // or fetch from DB

      const accessToken = await signAccessToken(user);
      const { token: newRefreshToken, jti: newJti } = await generateRefreshToken(user);

      const decodedNew = jwt.decode(newRefreshToken);
      const expSecondsNew = decodedNew.exp - decodedNew.iat;

      await storeRefreshToken(sub, newJti, expSecondsNew);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    }
  );
  }
  catch(err) {

  }
  finally {
    connection.release();
  }

});


module.exports = router;