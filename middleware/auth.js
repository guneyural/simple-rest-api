const jwt = require('jsonwebtoken');
const Config = require('../config');

module.exports = async function(req, res, next) {
    const getToken = req.header('auth-token');

    if(!getToken) return res.status(401).json({ msg: 'Login or register to see the content' });
    
    try {
        const decoded = await jwt.verify(getToken, Config.SECRET_KEY);
        req.user = decoded;
        next();
    } catch(err) {
        return res.status(500).json({ msg: err.message });
    }
}
