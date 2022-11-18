var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/product-helpers");
const cartHelpers = require("../helpers/cartHelpers");
const config = require("../config/otpconfig");

const { v4: uuidv4 } = require("uuid");

const client = require("twilio")(config.accountID, config.authToken);

const db = require("../model/connection"); //trial
const { response } = require("../app");
const { ObjectId } = require("mongodb");
const { resolveInclude } = require("ejs");

var nav = true;
var footer = true;

module.exports = {
  getCart: async (req, res) => {
    let cartCount = await cartHelpers.getCartCount(req.session.user._id);
    let total = await cartHelpers.getTotalAmount(req.session.user._id);

    cartHelpers.getCartProducts(req.session.user._id).then((cartItems) => {
      res.render("user/cart", {
        cartItems,
        user: req.session.user,
        cartCount,
        total,
      });
    });
  },
  addToCart: (req, res) => {
    cartHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  },
  changePrdQty: (req, res) => {
    cartHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await cartHelpers.getTotalAmount(req.session.user._id);
      res.json(response);
    });
  },
  deleteProduct: (req, res) => {
    cartHelpers.removeProduct(req.body).then((response) => {
      res.json(response);
    });
  },
  getCheckout: async (req, res) => {
    let cartProducts = await cartHelpers.getCartProducts(req.session.user._id);
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
    let address = await cartHelpers.getAddress(req.session.user._id);

    res.render("user/checkout", {
      total: total,
      user: req.session.user,
      address,
      cartProducts,
    });
  },
  postCheckout: async (req, res) => {
   req.body.userId=await req.session.user._id
    let total = await cartHelpers.getTotalAmount(req.session.user._id)
      ? await cartHelpers.getTotalAmount(req.session.user._id)
      : 0;
    console.log(total);
    if (total == 0) {
      console.log("totoal is zero");
      res.json({ status: true });
    } else {

 


      cartHelpers.placeOrder(req.body, total).then( () => {
        console.log("thiss order status")
      

        if (req.body.paymentMethod === "COD") {
          res.json({ success: true });
        } else if(req.body.paymentMethod === "UPI") {
         
          cartHelpers.generateRazorpay(req.session.user._id, total).then((response) => {
            console.log("tesing test1");
            res.json(response);
          });
        }
      });
    }
  },
  getOrders: (req, res) => {
    let userId = req.session.user._id;
    cartHelpers.getOrders(userId).then((orders) => {
      res.render("user/orders", { nav, orders });
    });
  },
  postCancelOrder: (req, res) => {
    cartHelpers
      .cancelOrder(req.body.orderId, req.body.prodId)
      .then((response) => {
        res.json(response);
      });
  },
  getAddress: (req, res) => {
    let userId = req.session.user._id;
    let addressId = req.params.id;
    cartHelpers.listAddress(userId, addressId).then((data) => {
      res.send(data[0].address);
    });
  },

  paymentVerification: (req, res) => {
   
   
    cartHelpers.verifyPayment(req.body).then(()=>{
        cartHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
          
            res.send({ status: true }); 
        })
    }).catch((err)=>{
        console.log('validation failed in verify payment hmac soes not match');
        res.send({status:"payment failed"})
    })
  },


}


