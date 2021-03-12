require("dotenv").config()
const mongoose = require('mongoose')

const CartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    // business_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'users'
    // },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        // productName: {
        //     type: String,
        //     required: true
        // },
        // page_name: {
        //     type: String,
        //     required: true
        // },
        // page_price: {
        //     type: Number,
        //     required: true
        // },
        // quantity: {
        //     type: Number,
        //     required: true,
        //     validate(value){
        //         if(value < 0) throw new Error("Quantity can't be less than 0")
        //     }
        // }
    }], // have to have main properties of products and connect it by Id
    created_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    }
})

const ProductModel = mongoose.model("Cart", CartSchema)

module.exports = ProductModel