require('dotenv').config();
const ejs = require('ejs');
const encrypt = require('mongoose-encryption');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}));
app.set('view engine', 'ejs');
app.set('views', 'templates/views');

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (error, result) {
        if (!error) {
            if (result.password === password) {
                res.render('secrets');
            } else {
                res.redirect('/login');
            }
        } else {
            console.log(error);
        }
    });

});

app.get('/register', function (req, res) {
    res.render('register');
});

app.post('/register', function (req, res) {
    
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (error) {
        if (!error) {
            res.render('secrets')
        } else {
            console.log(error);
        }
    });

});

app.listen(port = process.env.PORT || 3000, function () {
    console.log(`Server is running on port ${port}.`);
});