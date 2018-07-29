const express = require('express');
const _ = require('lodash');
const UserModel = require('../Models/UserModel');
// const multer = require('multer');
// const upload = multer({'dest':'Data/images'});
const router = express.Router();
const {authenticate} = require('../middleware/authenticate');


// register user
router.post('/register' , (req,res) => {
    console.log('register');console.log(req.body);
    let body = _.pick(req.body,['email','name','password']);
    body.email = _.toLower(body.email);
    let newUser = new UserModel(body);

    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
});
//login user
router.post('/login' , (req,res) => {
    const body = _.pick(req.body, ['email', 'password']);
    body.email = _.toLower(body.email);
     console.log(body);
    UserModel.findByCredentials(body.email, body.password).then((user) => {
        // console.log('generateAuthToken');
        return user.generateAuthToken().then((token) => {
            // console.log('x-auth');
            // console.log(user);
            res.header('x-auth', token).send(token);
        });
    }).catch((e) => {
         // console.log('error :'+e);
         res.status(400).send();
    });
});
// find my self
router.get('/me', authenticate, (req, res) => {
    res.send(req.user);
});
// logout
router.post('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.header('x-auth')).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});



module.exports = router;
