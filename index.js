const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const db = require('./db');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use('/', require('./routes/auth'));
app.use('/contacts', require('./routes/contacts'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/auth'));

app.get('/', (req, res) => res.redirect('/contacts'));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
