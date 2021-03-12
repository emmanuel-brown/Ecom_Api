require("dotenv").config()
const mongoose = require('mongoose')


const ProductSchema = mongoose.Schema({
    productName: {
        type: String,
        require: true,
    },
    catagories: [{
        type: String,
    }],
    tags: [{
        type: String,
    }],
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'businesses'
    },
    pages: [{
        page_name: {
            type: String,
            required: true
        },
        page_price: {
            type: Number,
            required: true
        },
        page_images: [{
            image_name: {
                type: String,
                required: true
            },
            image_url: { // use imgur
                type: String,
                required: true
            },
            html_alt: String
        }]
    }],
    created_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    }
})

const ProductModel = mongoose.model("Products", ProductSchema)

module.exports = ProductModel