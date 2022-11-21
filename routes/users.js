var express = require("express");
var router = express.Router();

const multer=require('multer')
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'Images')
  },
  filename:(req,file,cb)=>{
    console.log(file);
    cb(null,Date.now() + path.extname(file.originalname))
  }
})
const upload=multer({storage:storage})

const config = require("../config/otpconfig");



const {login, getLogin,verifyLogin,logout,getSignup,signup,getOtp,verifyOtp}=require('../controllers/auth')
const {shop,singleProduct}=require("../controllers/product")
const {getCart, addToCart,changePrdQty,deleteProduct,getCheckout,postCheckout,getOrders,postCancelOrder,getAddress,paymentVerification,showProfile,removeAddress}=require('../controllers/cart');
const cartHelpers = require("../helpers/cartHelpers");
const productHelpers = require("../helpers/product-helpers");
const { path } = require("../app");
const { resolveInclude } = require("ejs");
const { cancelOrder } = require("../helpers/cartHelpers");

var nav = true;
var footer = true;

//cart count middleware
const cartCount=async(req,res,next)=>{
  res.locals.cartCount=await cartHelpers.getCartCount(req.session.user._id);
  next()
}
//home page
router.get("/",async function (req, res) {
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
router.get("/single-product/:id", verifyLogin,cartCount, singleProduct);

router.get("/about-us", (req, res) => {
  res.send('coming soon')
});

router.get('/ordersuccess',verifyLogin,(req,res)=>{
  res.render('user/ordersuccess')
})



router.get('/cart',verifyLogin,getCart)
router.get('/add-to-cart/:id',verifyLogin,addToCart)
router.post('/change-product-quantity',verifyLogin,changePrdQty)
router.post('/remove-product',verifyLogin,deleteProduct)

router.get('/checkout',verifyLogin,getCheckout)
router.post('/checkout',verifyLogin,postCheckout)

router.get('/orders',verifyLogin,cartCount,getOrders)

router.post('/cancel-order',verifyLogin,postCancelOrder)

router.get('/fill-address/:id',verifyLogin,getAddress)

router.post("/verify-payment",verifyLogin,paymentVerification )

router.get('/my-account',verifyLogin,showProfile)

router.get('/remove-address/:id',verifyLogin,removeAddress)


module.exports = router;
