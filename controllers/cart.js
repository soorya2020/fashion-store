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
        let total=await cartHelpers.getTotalAmount(req.session.user._id)
  

        cartHelpers.getCartProducts(req.session.user._id).then((cartItems)=>{  
            res.render("user/cart",{cartItems,nav,user:req.session.user,cartCount,total})
        })
    },
    addToCart:(req,res)=>{
        cartHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
            res.json({status:true})
        })
         
    },
    changePrdQty:(req,res)=>{
        cartHelpers.changeProductQuantity(req.body).then(async(response)=>{
            response.total= await cartHelpers.getTotalAmount(req.session.user._id)
            console.log(response.total)
            res.json(response)
        })
    },
    deleteProduct:(req,res)=>{
        cartHelpers.removeProduct(req.body).then((response)=>{
            res.json(response)
        })
    },
    placeOrder:async(req,res)=>{
        let total=await cartHelpers.getTotalAmount(req.session.user._id)
        res.send(total)
    }
     
}