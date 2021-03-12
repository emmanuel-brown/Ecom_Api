require('dotenv').config()
const jwt = require("jsonwebtoken")
const User = require('../models/user.models')

module.exports = async function auth(req, res, next) {
    let token = ""
    if(req.header('authorization')){
        token = req.header('authorization').replace('Bearer ','')
        if (!token) res.status(401).send('No token provided. Access Denied.')
    } else {
        res.status(401).send("No token sent")
    }
    
    try{
        const decoded = jwt.verify(token, process.env.jwtPrivateKey)
        const foundUser = await User.findById(decoded._id)
        if(!foundUser) res.status(401).send('Invalid token')

        req.token = token
        req.user = decoded
        req.isAdmins = decoded.extension
        next()
    } catch (e) {
        res.status(400).send('Invalid token')
    }
}