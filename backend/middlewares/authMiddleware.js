const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Perlu Login' });

    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    jwt.verify(cleanToken, process.env.TOKEN_SECRET || 'TOKENNYA', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token TIDAK Valid' });
        req.userId = decoded.id;
        next();
    });
};
