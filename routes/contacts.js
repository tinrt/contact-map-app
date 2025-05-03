const express = require('express');
const router = express.Router();
const geocodeAddress = require('../geocode');

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).render('unauthorized');
    }
    next();
};


router.get('/', (req, res) => {
    req.db.all("SELECT * FROM Contact", [], (err, contacts) => {
        if (err) {
            console.error("Error fetching contacts:", err);
            return res.status(500).send("Internal server error");
        }
        res.render('index', { contacts });
    });
});

router.get('/new', (req, res) => {
    res.render('create', { form: {} });
});

router.post('/new', async (req, res) => {
    const {
        firstName, lastName, title, address,
        phone, email,
        contactByEmail, contactByPhone, contactByMail
    } = req.body;

    const fullAddress = `${address}`;
    const coords = await geocodeAddress(fullAddress);

    if (!coords) {
        return res.render('create', {
            error: 'Could not find location for the address. Please check the address and try again.',
            form: req.body
        });
    }

    const sql = `
        INSERT INTO Contact (
            FirstName, LastName, Title, Phone, Email, Address,
            Contact_By_Email, Contact_By_Phone, Contact_By_Mail,
            Lat, Lng
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        firstName, lastName, title, phone, email, address,
        contactByEmail ? 1 : 0,
        contactByPhone ? 1 : 0,
        contactByMail ? 1 : 0,
        coords.lat, coords.lng
    ];

    req.db.run(sql, params, function (err) {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).send("Database error");
        }
        res.redirect('/');
    });
});

// GET /contacts/:id/edit → show edit form
router.get('/:id/edit',requireLogin, (req, res) => {
    const id = req.params.id;
    req.db.get("SELECT * FROM Contact WHERE ID = ?", [id], (err, contact) => {
        if (err || !contact) return res.status(404).send("Contact not found");
        res.render('edit', { contact });
    });
});

// POST /contacts/:id/edit → update contact
router.post('/:id/edit',requireLogin, async (req, res) => {
    const id = req.params.id;
    const {
        firstName, lastName, title, address,
        phone, email,
        contactByEmail, contactByPhone, contactByMail
    } = req.body;

    const fullAddress = `${address}`;
    const coords = await require('../geocode')(fullAddress);

    if (!coords) {
        req.db.get("SELECT * FROM Contact WHERE ID = ?", [id], (err, contact) => {
            res.render('edit', {
                contact,
                error: 'Could not geolocate the new address. Please verify it.'
            });
        });
        return;
    }

    req.db.run(`
        UPDATE Contact SET
            FirstName=?, LastName=?, Title=?, Phone=?, Email=?, Address=?,
            Contact_By_Email=?, Contact_By_Phone=?, Contact_By_Mail=?, Lat=?, Lng=?
        WHERE ID=?
    `, [
        firstName, lastName, title, phone, email, address,
        contactByEmail ? 1 : 0,
        contactByPhone ? 1 : 0,
        contactByMail ? 1 : 0,
        coords.lat, coords.lng,
        id
    ], err => {
        if (err) return res.status(500).send("Error updating contact");
        res.redirect('/contacts');
    });
});

// GET /contacts/:id/delete → confirm deletion
router.get('/:id/delete',requireLogin, (req, res) => {
    const id = req.params.id;
    req.db.get("SELECT * FROM Contact WHERE ID = ?", [id], (err, contact) => {
        if (err || !contact) return res.status(404).send("Contact not found");
        res.render('delete', { contact });
    });
});

// POST /contacts/:id/delete → perform deletion
router.post('/:id/delete',requireLogin, (req, res) => {
    const id = req.params.id;
    req.db.run("DELETE FROM Contact WHERE ID = ?", [id], err => {
        if (err) return res.status(500).send("Error deleting contact");
        res.redirect('/contacts');
    });
});

module.exports = router;
