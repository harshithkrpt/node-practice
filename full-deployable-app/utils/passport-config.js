const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { mysqlPool } = require('../db/mysql');

const setupPassport = (passport) => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.OAUTH_CALLBACK_URL, // <- correct property name
      proxy: true // helpful if behind a proxy/HTTPS terminator
    },
    async (accessToken, refreshToken, profile, done) => {
      let connection;
      try {
        connection = await mysqlPool.getConnection();
        const [rows] = await connection.query(
          "SELECT username, password FROM users WHERE username = ? LIMIT 1",
          [profile.id]
        );

        // if no user, insert
        if (!rows.length) {
          await connection.query(
            "INSERT INTO users(username, password, first_name, is_oauth, o_auth_provider) VALUES (?,?,?,?,?);",
            [
              profile.id,
              "dummy-password",
              profile.displayName, // use profile, not rows/user
              true,
              'google'
            ]
          );
        }

        // Return a minimal user object (you can fetch DB row if you prefer)
        return done(null, {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos,
          provider: 'google',
          accessToken,
          refreshToken
        });
      } catch (err) {
        return done(err);
      } finally {
        if (connection) connection.release();
      }
    }
  ));

  passport.serializeUser((user, done) => {
        done(null, user.id); // storing info in session
  });

  passport.deserializeUser(async (id, done) => {
    let connection;
    try {
      connection = await mysqlPool.getConnection();
      const [rows] = await connection.query(
        "SELECT username, first_name as displayName FROM users WHERE username = ? LIMIT 1",
        [id]
      );
      if (!rows.length) return done(null, false);
      // return a user object
      return done(null, { username: rows[0].username, displayName: rows[0].displayName });
    } catch (err) {
      return done(err);
    } finally {
      if (connection) connection.release();
    }
  });
};

module.exports = {
  setupPassport
};
