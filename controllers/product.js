var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/product-helpers");
const config = require("../config/otpconfig");
const client = require("twilio")(config.accountID, config.authToken);

var nav = true;
var footer = true;




module.exports={
    shop:(req, res) => {
        var user = req.session.user;
        productHelpers.getAllProducts().then((products) => {
          var value = req.session.loggedIn;
          res.render("user/shop", {
            products,
            admin: false,
            user,
            value,
            nav,
            footer,
          });
          
        });
      },

      singleProduct:(req, res) => {
        let prodId=req.params.id
        productHelpers.getProductDetails(prodId).then((product)=>{
          console.log(product);
          res.render('user/single-product',{nav:true,footer:true,product})
        })
        
      },



    
}