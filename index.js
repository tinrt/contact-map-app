const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

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
  res.locals.user = req.session.user || null;
  next();
});


app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/', require('./routes/auth'));
app.use('/contacts', require('./routes/contacts'));


app.get('/', (req, res) => res.redirect('/contacts'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
