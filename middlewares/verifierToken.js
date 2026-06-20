const jwt = require('jsonwebtoken')

function verification(req, res, next) {
    const authorization = req.headers['authorization'];

    if (!authorization) {
        return res.status(401).json({ Message: "Token manquant" })
    }

    const token = authorization.split(' ')[1]

    if (!token) {
        return res.status(401).json({ Message: 'Token invalide' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ Message: 'Token expiré ou invalide' })
    }
}

module.exports = verification