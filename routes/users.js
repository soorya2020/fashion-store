var express = require("express");
var router = express.Router();

const config = require("../config/otpconfig");

const {login, getLogin,verifyLogin,logout,getSignup,signup,getOtp,verifyOtp}=require('../controllers/auth')
const {shop,singleProduct}=require("../controllers/product")

var nav = true;
var footer = true;

//home page
router.get("/", function (req, res) {
  res.render("index", { nav, footer });
});

//user login and signup
router.get("/login", getLogin);
router.post("/login",login );
router.get("/signup", getSignup);
router.post("/signup", signup);
router.get("/logout", logout);

//otp
router.get("/otpform", (req, res) => {
  res.render("user/otp-login", { nav: false, footer: false });
});
router.get("/otp-login", getOtp);
router.get("/verify", verifyOtp);

//shop
router.get("/shop", verifyLogin, shop);
router.get("/single-product/:id", verifyLogin, singleProduct);

router.get("/about-us", (req, res) => {
  res.send('coming soon')
});

router.get("/orders", verifyLogin, (req, res) => {
  res.send('coming soon')
});




module.exports = router;
