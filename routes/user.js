require("dotenv").config();
const auth = require('../middleware/auth')
const UserRouter = require('express').Router()
const User = require('../models/user.models')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

/*
    make an endpoint to renew token
    *remove token out of date token in auth.js (look at RV video to enable exp date property from token)
*/

// POST

UserRouter.post('/create', async (req, res) => {

    try {
        const doesUserExist = await User.findOne({ email: req.body.email })
        if(doesUserExist) res.status(400).send('user with this email adress already exists')
        const user = await new User(req.body)
        user.save()
        const token = await user.generateAuthToken()
        res.header("authorization", token).status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

UserRouter.get('/retreive', async (req, res) =>{
    const { email, password } = req.body
    try{
        const user = await User.findOne({ email })
        if(!user) res.status(400).send("Invalid email or password")
        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword) res.status(400).send("Invalid email or password")

        const token = await user.generateAuthToken(true)
        res.header("authorization", token).status(200).send(_.pick(user, ['_id', 'email', 'firstName', 'lastName', 'tokens']))
    } catch (e) {
        console.log(e)
        res.status(404).send(e)
    }
})

// GET

UserRouter.get('/refresh', auth, async (req, res) =>{
    try{
        const user = await User.findById(req.user._id)
        const token = await user.generateAuthToken(true)
        res.header("authorization", token).status(200).send({user})
    } catch(e){
        res.status(400).send("unable to refresh token")
    }
})

// UserRouter.get('/all', async (req, res) =>{
//     const { email, password } = req.body
//     try{
//         const user = await User.find({})

//         res.send(_.map(user, _.partialRight(_.pick, ['_id', 'email', 'firstName', 'lastName'])))
//     } catch (e) {
//         console.log(e)
//         res.status(404).send(e)
//     }
// })

// PATCH

UserRouter.patch('/', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.user._id)

        updates.forEach(update => user[update] = req.body[update])

        user.save()

        if (!user) {
            return res.status(404).send("Invalid userId")
        }
        res.send(user)
    } catch (e){
        res.status(400).send(e)
    }
})

// DELETE

UserRouter.delete('/logoutall', auth, async (req, res) =>{
    try{
        const user = await User.findById(req.user._id, (err, doc) =>{
            if(err) res.send(400).send("unable to retrieve user")
        })
        user.tokens = []
        user.save()
        res.status(200).send("User has been logged out")
        res.send(user)
    } catch (e){
        res.status(400).send("bad request")
    }
})

UserRouter.delete('/remove', auth, async (req, res) =>{
    try{
        await User.findByIdAndDelete(req.user._id, (err, doc) =>{
            if(err || doc === null) {
                res.status(400).send("Invalid Id")
            } else {
                res.send({message: "This user no longer exists"})
            }
        })

        // res.send(`Account ${id} no longer exists`)

    } catch(e){
        res.status(400).send(e)
    }
})



module.exports = UserRouter