const UserModel = require('../Models/UserModel');

const authenticate = (req, res, next) => {
  console.log('authenticate');console.log(req.body);
    const token = req.header('x-auth');
    UserModel.findByToken(token).then((user) => {
        console.log(user);
        if (!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
         console.log('reject : ' + token);
        res.status(401).send();
    });
};

module.exports = {authenticate};
