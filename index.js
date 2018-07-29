const express = require('express');
const passport = require('passport');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const  mongoose = require('mongoose');
const _ = require('lodash');
const UserRoute = require('./Routes/UserRoute') ;
const UserModel = require('./Models/UserModel');
// const cors = require('cors');
const config = require('./config');

const app = express();
const port = process.env.PORT || config.Port;
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect(config.DBAddress);
const db = mongoose.connection;

app.use(bodyParser.json());
// app.use(cors());

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
app.use('/user', UserRoute);
// get all admins
app.get('/',(req,res) => {
  console.log('test');
  res.send('<h1>SmartLife</h1>');
});

app.listen(port,() => {
    console.log('started on Port : ' + port);
});
