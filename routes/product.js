require("dotenv").config();
const auth = require('../middleware/auth')
const ProductRouter = require('express').Router()
const Product = require('../models/product.models')

const toArray = prop => typeof prop === 'string' ? [ prop ] : prop
const validateProps = (allowed, incoming) => incoming.every(incoming => allowed.includes(incoming))

/*
    use req.user from auth to see if user is admin to create a product
    get request needs help
*/

// POST

ProductRouter.post('/create', auth, async (req, res) =>{
    const {
        productName,
        catagories,
        tags,
        business_id,
        pages
    } = req.body
    const productProperties = {
        productName,
        catagories,
        tags,
        business_id,
        pages
    }
    try{
        const doesProductExist = await Product.findOne({ productName, business_id })
        if(doesProductExist) res.status(400).send("product already exist")

        const product = await new Product(productProperties)
        product.save()

        res.status(200).send(product)
    } catch (e){
        res.status(400).send("Was unable to create new product")
    }
})

// PATCH

ProductRouter.patch('/:id', auth, async (req, res) =>{
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'productName', 'catagories', 'tags', 'pages' ]
    const isValidOperation = validateProps(allowedUpdates, updates)

    if(!isValidOperation) res.status(400).send({ error: 'Invalid updates!' })
    try{
        const product = await Product.findById(id)
        updates.forEach(update => product[update] = req.body[update])

        product.save()

        if(!product) res.status(404).send("invalid product Id")
        res.status(200).send(product)
    } catch(e){
        res.status(400).send("unable to update product")
    }
})

ProductRouter.get('/collection', async (req, res) =>{ //this component needs help with filtering
    const queryKeys = Object.keys(req.query)
    queryKeys.forEach(q => req.query[q] = toArray(req.query[q]))
    const validFilters = [ 'productName', 'catagories', 'tags', 'pages' ]
    if(!validateProps(validFilters, queryKeys)) res.status(400).send({ error: 'Invalid queries' })

    try{
        const products = await Product.find({ catagories: { '$exists': true, '$all': req.query.catagories } })
        res.status(200).send(products)
    } catch (e){
        res.status(400).send({
            error: "unable to retieve products"
        })
    }
})


module.exports = ProductRouter