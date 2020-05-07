const router = require('express').Router();
const User = require('../models/user');
const Config = require('../config');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({ msg: 'Enter all fields.' });
    }

    const getUser = await User.findOne({ email });
    if(getUser) return res.status(400).json({ msg: 'User with that email exists.' });

    const newUser = await User.create(req.body);

    const token = await jwt.sign({ id: newUser._id }, Config.SECRET_KEY, { expiresIn: '7d' });

    res.status(201).json({
        token,
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    });
});

router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password) return res.status(400).json({ msg: 'Enter all fields.' });

    const getUser = await User.findOne({ email });
    if(!getUser) return res.status(404).json({ msg: 'User does not exist' });

    getUser.comparePassword(password, async (err, isMatch) => {
        if(err) return res.status(500).json({ msg: "An error occured" });
        if(!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        const token = await jwt.sign({ id: getUser._id }, Config.SECRET_KEY, { expiresIn: '7d' });
        const user = {id: getUser._id, username: getUser.username, email: getUser.email};
        return res.json({ token, user });
    });
});

router.get('/', (req, res) => {
    User.find()
    .then(user => res.json(user))
    .catch(err => res.status(400).json({ msg: 'Could not fetch the users' }));
});

module.exports = router;