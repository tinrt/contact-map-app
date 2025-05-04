const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const db = require('./db');
const app = express();

// === View engine setup ===
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// === Middleware ===
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'secret-key', // Change to secure secret in production
  resave: false,
  saveUninitialized: false
}));

// 🔧 Make user session available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// 🔧 Attach DB to request object
app.use((req, res, next) => {
  req.db = db;
  next();
});

// === Routes ===
app.use('/', require('./routes/auth'));
app.use('/contacts', require('./routes/contacts'));

// Redirect root to contact list
app.get('/', (req, res) => res.redirect('/contacts'));

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
