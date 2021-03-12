require("dotenv").config();
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email was not valid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    extension: [{
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'businesses'
        },
        isAdmin: {
            type: Boolean,
            required: true
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    created_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    }
})

UserSchema.methods.generateAuthToken = async function (shouldSave) {
    try{
        const user = this
        const token = await jwt.sign({ _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName }, process.env.jwtPrivateKey)
        user.tokens = user.tokens.concat({ token }) 
        shouldSave && user.save()
        
    
        return token
    } catch (e){
        console.log(e)
    }
}

UserSchema.pre('save', async function (next){
    const user = this

    if (user.isModified('password')) {
        const salt = bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, 10)
    }

    next()
})



const UserModel = mongoose.model("Users", UserSchema)

module.exports = UserModel