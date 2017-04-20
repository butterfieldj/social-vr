var express = require('express');
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var routes = require('./routes/index');
var auth = require('./routes/auth');
var feed = require('./routes/feed');
var app = express();
var port = process.env.PORT || 8000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({ secret: 'roxana' }));

require('./config/passport')(app);

app.use('/', routes);
app.use('/auth', auth);
app.use('/feed', feed);

app.use(express.static(path.join(__dirname, '')));

if (!process.env.CONSUMER_KEY) {
    var env = require('./env.js');
}

var server = require('http').createServer(app).listen(port, function() {
    console.log('listening on ' + port);
});