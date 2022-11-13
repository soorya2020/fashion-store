var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/product-helpers");
const cartHelpers=require('../helpers/cartHelpers')
const config = require("../config/otpconfig");

const client = require("twilio")(config.accountID, config.authToken);

const db = require('../model/connection');//trial
const { response } = require("../app");
const { ObjectId } = require("mongodb");
const { resolveInclude } = require("ejs");

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
            res.json(response)
        })
    },
    deleteProduct:(req,res)=>{
        cartHelpers.removeProduct(req.body).then((response)=>{
            res.json(response)
        })
    },
    getCheckout:async(req,res)=>{
        let total=await cartHelpers.getTotalAmount(req.session.user._id)
        let address=await cartHelpers.getAddress(req.session.user._id)
        console.log(address,"hei soosrya");
        res.render('user/checkout',{total:total,user:req.session.user,address})
    },
    postCheckout:async(req,res)=>{
        req.body.userId=req.session.user._id
        let total=await cartHelpers.getTotalAmount(req.session.user._id)
        cartHelpers.placeOrder(req.body,total).then((orderStatus)=>{
            console.log("soorya",orderStatus);
            res.json(orderStatus)
        })
        
    },
    getOrders:(req,res)=>{
        let userId=req.session.user._id
        cartHelpers.getOrders(userId).then((orders)=>{
          res.render('user/orders',{nav,orders})
        })
      
      },
    postCancelOrder:(req,res)=>{
        cartHelpers.cancelOrder(req.body.orderId,req.body.prodId).then((response)=>{
            res.json(response)
        })
    },
    getAddress:(req,res)=>{
        return new Promise(async(resolve,reject)=>{

            let userId=req.session.user._id
            let addressId=req.params.id
            console.log(addressId);
            let data=await db.addresses.aggregate([
                {
                    $match:{userId:userId}
                },
                {
                    $unwind:'$address'
                },
                {
                    $match:{
                        'address._id':ObjectId(addressId)
                    }
                }
                
            ])
            res.send(data[0].address)
        })
        
        }
        
     
}