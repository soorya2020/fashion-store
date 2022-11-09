var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/product-helpers");
const cartHelpers=require('../helpers/cartHelpers')
const config = require("../config/otpconfig");

const client = require("twilio")(config.accountID, config.authToken);

const db = require('../model/connection')//trial

var nav = true;
var footer = true;

module.exports={

    getCart:async(req,res)=>{
        let cartCount=await cartHelpers.getCartCount(req.session.user._id)
        cartHelpers.getCartProducts(req.session.user._id).then((cartItems)=>{
            console.log("reached cart renmdrr");
            
            res.render("user/cart",{cartItems,nav,user:req.session.user,cartCount})
        })
    },
    addToCart:(req,res)=>{
        console.log("reached controler of addtocart");
        cartHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
            res.json({status:true})
        })
         
    },
    
}