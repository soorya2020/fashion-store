var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/product-helpers");
const config = require("../config/config");
const client = require("twilio")(config.accountID, config.authToken);

var nav = true;
var footer = true;

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index", { nav, footer });
});

//------------------------------middleware to check is user login in or not ------------------
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
//-------------------------------------------------------------------------------------
router.get("/shop", verifyLogin, (req, res) => {
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
    console.log(products);
  });
});
//-------------------------------------USER login-----------------------------

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/shop");
  } else {
    res.render("user/user-login", {
      nav: false,
      footer: false,
      loginErr: req.session.loginErr,
    });
    req.session.loginErr = false;
  }
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.send({ value: "success" });
    } else {
      req.session.loginErr = true;
      res.send({ value: "failed" });
    }
  });
});
//-------------------------------------userLogout--------------------------------------
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

//------------------------------------signup------------------------------------------------

router.get("/signup", (req, res) => {
  res.render("user/signup", { nav: false, footer: false });
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (!response.status) {
      res.send({ value: "failed" });
    } else {
      req.session.loggedIn = true; //user can view product after signup
      res.send({ value: "success" });
    }
  });
  // res.render('user/signup',{nav:false,footer:false})
});
//----------------------------------otp login--------------------------------------------

router.get("/otpform", (req, res) => {
  res.render("user/otp-login", { nav: false, footer: false });
});

router.get("/otp-login", (req, res) => {
  res.render("user/otp-login", { nav: false, footer: false });
  client.verify
    .services(config.serviceID)
    .verifications.create({
      to: `+91${req.query.phonenumber}`,
      channel: "sms",
    })
    .then((data) => {
      res.status(200).send(data);
    });
});

router.get("/verify", (req, res) => {
  console.log(res);
  client.verify
    .services(config.serviceID)
    .verificationChecks.create({
      to: `+91${req.query.phonenumber}`,
      code: req.query.code,
    })
    .then((data) => {
      if (data.valid) {
        req.session.loggedIn = true;
        res.status(200);
        res.send({ value: "success" });
      }
      res.send({ value: "failed" });
    })
    .catch((err) => {
      res.send({ value: "error" });
    });
});

//------------------------------------------------------------------------------

router.get("/single-product/:id", verifyLogin, (req, res) => {
  let prodId=req.params.id
  productHelpers.getProductDetails(prodId).then((product)=>{
    console.log(product);
    res.render('user/single-product',{nav:true,footer:true,product})
  })
  
});

router.get("/about-us", (req, res) => {
  res.render("user/about-us", { nav: true, footer: true });
});

router.get("/wishlist", verifyLogin, (req, res) => {
  res.render("user/wishlist", { nav: true, foooter: true });
});

module.exports = router;
