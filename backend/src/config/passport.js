const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

const strategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            // Check if user exists by google_id
            const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

            if (res.rows.length > 0) {
                // User found with google_id
                return cb(null, res.rows[0]);
            }

            // Check if user exists by email (pre-created by admin)
            const emailRes = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);

            if (emailRes.rows.length > 0) {
                // User exists with this email - link the Google account
                const user = emailRes.rows[0];

                // Update user with google_id and avatar
                const updateRes = await pool.query(
                    'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2), username = COALESCE(username, $3) WHERE id = $4 RETURNING *',
                    [profile.id, profile.photos[0].value, profile.displayName, user.id]
                );
                return cb(null, updateRes.rows[0]);
            }

            // User does not exist - reject login
            // Return null, false to indicate authentication failure (triggers failureRedirect)
            return cb(null, false, { message: 'Your email is not authorized.' });

        } catch (err) {
            return cb(err, null);
        }
    }
);

// DEBUG: Intecept error response to see why Google is rejecting the token exchange
const originalParse = strategy.parseErrorResponse;
strategy.parseErrorResponse = function (body, status) {
    console.log('--- OAuth2 Specific Error ---');
    console.log('Status:', status);
    console.log('Body:', body);
    console.log('-----------------------------');
    return originalParse.call(this, body, status);
};

passport.use(strategy);

module.exports = passport;
