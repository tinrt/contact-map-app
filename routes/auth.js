const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    req.db.get("SELECT * FROM Users WHERE Username = ?", [username], (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.Password)) {
            return res.render('login', { error: "Invalid username or password" });
        }
        req.session.user = user;
        res.redirect('/contacts');
    });
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {
    const { firstName, lastName, username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.render('signup', { error: "Passwords do not match" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    req.db.run(
        "INSERT INTO Users (FirstName, LastName, Username, Password) VALUES (?, ?, ?, ?)",
        [firstName, lastName, username, hashed],
        function (err) {
            if (err) return res.render('signup', { error: "Username already exists" });
            res.redirect('/login');
        }
    );
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
