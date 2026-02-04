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
                // Check if user exists
                const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

                if (res.rows.length > 0) {
                    return cb(null, res.rows[0]);
                } else {
                    // Create new user
                    // Check if email exists first to avoid constraint error (if user signed up normally before)
                    const emailRes = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);

                    if (emailRes.rows.length > 0) {
                        // Link account - update google_id
                        const user = emailRes.rows[0];
                        const updateRes = await pool.query(
                            'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3 RETURNING *',
                            [profile.id, profile.photos[0].value, user.id]
                        );
                        return cb(null, updateRes.rows[0]);
                    }

                    const newUser = await pool.query(
                        'INSERT INTO users (username, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
                        [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0].value]
                    );
                    return cb(null, newUser.rows[0]);
                }
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
