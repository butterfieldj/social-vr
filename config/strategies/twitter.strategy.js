var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var env = require('../../env.js');

module.exports = function() {
    passport.use(new TwitterStrategy({
        consumerKey: env.CONSUMER_KEY,
        consumerSecret: env.CONSUMER_SECRET,
        callbackURL: 'http://localhost:8000/auth/twitter/callback',
        passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {
        var user = {};

        user.displayName = profile.displayName;
        user.twitter = {};
        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.tokenSecret = tokenSecret;

        done(null, user);
    }));
}
