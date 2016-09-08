var express = require('express');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');

var MongoClient = require('mongodb').MongoClient;

var crypto = require('crypto');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

var url = process.env.MONGODB_URI;

var algorithm = 'aes-256-cbc';

function encryptPassword(password, salt) {
    if (!password || !salt) return '';
    return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
}

function makeSalt() {
    return crypto.randomBytes(16).toString('base64');
}

function authenticate(password, salt, hashedPassword) {
    return encryptPassword(password, salt) === hashedPassword;
}

MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log('Failed to connecto to MongoDB');
        return;
    }
    console.log('Successfully connected to MongoDB');

    function signToken(user) {
        return jwt.sign({
            _id: user._id,
            email: user.email
        }, process.env.SECRET, {
            expiresIn: '1d'
        });
    }

    //create email index for faster searches
    db.collection('users').createIndex({
        email: 1
    }, {
        unique: true,
        name: 'email'
    });

    app.post('/api/signup', function(req, res) {
        //check if email is in use
        db.collection('users').findOne({
            email: req.body.email
        }, function(err, user) {
            if (user) { //user already exists return error
                return res.status(400).send({
                    error: {
                        type: 'email',
                        message: 'Email already in use.'
                    }
                });
            }

            var salt = makeSalt();

            user = {
                email: req.body.email,
                password: encryptPassword(req.body.password, salt),
                salt: salt
            }

            db.collection('users').insertOne(user, function(err, doc) {
                user._id = doc.insertedId;
                res.json({
                    token: signToken(user),
                    user: user
                });
            });
        });
    });

    app.post('/api/login', function(req, res) {
        db.collection('users').findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) return res.status(400).send(err);
            if (!user) {
                return res.status(401).send({
                    error: {
                        type: 'password',
                        message: 'Invalid credentials'
                    }
                });
            }
            if (authenticate(req.body.password, user.salt, user.password)) {
                return res.json({
                    token: signToken(user),
                    user: user
                });
            }
            return res.status(401).send({
                error: {
                    message: 'Invalid credentials',
                    type: 'password'
                }
            });
        });
    });

    app.get('/api/user', expressJWT({
        secret: process.env.SECRET
    }), function(req, res) {
        db.collection('users').findOne({
            email: req.user.email
        }, function(err, user) {
            if (err) return res.status(400).send(err);
            res.json(user);
        });
    });
});

app.use(express.static(__dirname + '/client'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.all(/^\/(?!api).*/, function(req, res, next) {
    //send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', {
        root: __dirname + '/client'
    });
});

var server = app.listen(process.env.PORT, function() {
    console.log('Express server listening on port', process.env.PORT);
});
