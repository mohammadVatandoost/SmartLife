const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid Email'
        }
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    let User = this;
    let UserObj = User.toObject();
    return _.pick(UserObj,['_id','email','name']);
}

UserSchema.methods.generateAuthToken = function () {
    let User = this;
    let access = 'auth';
    let token = jwt.sign({_id: User._id.toHexString(),access },'mvs1995').toString();
    User.tokens.push({ access , token });

    return User.save().then(() => {
        return token;
    });
}

UserSchema.methods.removeToken = function (token) {
    let User = this;
   // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    return User.update({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'mvs1995');
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    console.log('findByCredentials : '+ email);
    return User.findOne({email: email}).then((User) => {
        if (!User) {
            return Promise.reject();
        }
        console.log('find email');
        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, User.password, (err, res) => {
                if (res) {
                    resolve(User);
                } else {
                    reject();
                }
            });
        });
    });
};


UserSchema.pre('save', function (next) {
    let User = this;

    if (User.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(User.password, salt, (err, hash) => {
                User.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

module.exports = mongoose.model('UserModel', UserSchema);
