require("dotenv").config();
const auth = require('../middleware/auth')
const CartRouter = require('express').Router()
const Cart = require('../models/cart.models')

const toArray = prop => typeof prop === 'string' ? [ prop ] : prop
// const validateProps = (allowed, incoming) => incoming.every(incoming => allowed.includes(incoming))


CartRouter.post('/', auth, async (req, res) =>{
    const { products } = req.body //validate products
    // products = toArray(products)
    let preCart = { 
        user: req.user._id,
        products
    }

    try{
        const cart = await new Cart(preCart)
        cart.save()
        res.status(200).send(cart)
    } catch(e) {
        res.status(400).send("creating cart failed")
    }
})

CartRouter.put('/', auth, async (req, res) =>{
    const products = req.body //validate products
    // products = toArray(products)

    // let preCart = { 
    //     user: req.user._id,
    //     products
    // }

    try{
        const cart = await Cart.findOne({ user: req.user._id })
        cart.products = products
        cart.save()
        res.status(200).send(cart)
    } catch(e) {
        res.status(400).send({error: "creating cart failed"})
    }
})

CartRouter.get('/', auth, async (req, res) =>{
    try{
        cart = await Cart.find({ user: req.user._id })
            .populate('user products', '-tokens -password')
        res.status(200).send(cart)
    } catch(e) {
        res.status(400).send("Getting cart failed")
    }
})

CartRouter.delete('/', auth, async (req, res) =>{
    try{
        const existingCart = await Cart.findOne({ user: req.user._id })
        if(existingCart) {
            await Cart.deleteOne({user: req.user._id}, (err, doc) =>{
                if(err || doc == null) {
                    res.status(400).send("Cart does not exist")
                } else {
                    res.send({message: "This cart no longer exists"})
                }
            })
        } else {
            console.log("unable to remove cart. Please check")
            res.status(400).send("cart does not exist")
        }
    } catch(e){
        res.status(404).send("invalid request")
    }
})

module.exports = CartRouter