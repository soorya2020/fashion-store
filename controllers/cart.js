require("dotenv").config();
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

const paypal = require("@paypal/checkout-server-sdk");
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

var nav = true;
var footer = true;

module.exports = {
  getCart: async (req, res) => {
    let cartCount = await cartHelpers.getCartCount(req?.session?.user?._id);
    let total = await cartHelpers.getTotalAmount(req?.session?.user?._id);
    
    cartHelpers.getCartProducts(req?.session?.user?._id).then((cartItems) => {
      
      res.render("user/cart", {
        cartItems,
        user: req.session.user,
        cartCount,
        total,
        nav,
      });
    });
  },
  addToCart: (req, res) => {
    cartHelpers.addToCart(req.params.id, req.session.user._id).then((quantity) => {
      res.json({ status: true,quantity:quantity });
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
      nav,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
    });
  },
  postCheckout: async (req, res) => {
    req.body.userId = await req.session.user._id;
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
    let totalPrice = total;

    if (total == 0) {
      res.json({ status: true });
    } else {
      
      cartHelpers.placeOrder(req.body, total).then(async() => {
        
        if (req.body.paymentMethod === "COD") {

          let orders = await db.orders.find({ userId: `${req.session.user._id}` });
          let myOrderId =  orders[0]?.orders.reverse();
          myOrderId = myOrderId[0]._id;
          cartHelpers.changePaymentStatus(myOrderId,req.session.user._id).then(()=>{
          res.json({ cod: true });
          })

        } else if (req.body.paymentMethod === "UPI") {
          cartHelpers.generateRazorpay(req.session.user._id, totalPrice).then((response) => {
           
              res.json(response);
            });

        } else if (req.body.paymentMethod === "PAYPAL") {
          res.json({ paypal: true, totalPrice: totalPrice });
        }
      });
    }
  },
  getOrders: (req, res) => {
    let userId = req.session.user._id;
    cartHelpers.getOrders(userId).then((orders) => {
      console.log();
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
    console.log("called fill address");
    let userId = req.session.user._id;
    let addressId = req.params.id;
    cartHelpers.listAddress(userId, addressId).then((data) => {
      res.send(data[0]?.address);
    });
  },

  paymentVerification: (req, res) => {
    cartHelpers
      .verifyPayment(req.body)
      .then(() => {
        console.log(req.body["order[receipt]"]);
        console.log('thsis is orsdr id');
        cartHelpers.changePaymentStatus(req.body["order[receipt]"],req.session.user._id).then(() => {
          res.send({ status: true });
        });
      })
      .catch((err) => {
        res.send({ status: "payment failed" });
      });
  },
  showProfile: async (req, res) => {
    let address = await cartHelpers.getUserAddress(req.session.user._id);
    let user = await db.users.findOne({ _id: req.session.user._id });

    res.render("user/profile", { nav, user: user, address: address[0] });
  },
  removeAddress: (req, res) => {
    cartHelpers.removeAddress(req.params.id).then(() => {
      res.send({ staus: true });
    });
  },
  updateAddress: (req, res) => {
    cartHelpers.editAddress(req.session.user._id, req.body).then(() => {
      res.send({ status: true });
    });
  },
  addAddress: (req, res) => {
    cartHelpers.addAddress(req.session.user._id, req.body).then(() => {
      res.send({ status: true });
    });
  },
  paypalPayment: async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    const total = req.body.total;
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: total,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: total,
              },
            },
          },
        },
      ],
    });
    //reach hrere after payment success
    try {
      const order = await paypalClient.execute(request);
      res.json({ id: order.result.id });

      console.log(order);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: e.message });
    }
  },
  verifyPaypal: async (req, res) => {
    console.log("reached here line 191 cartjs");
    let orders = await db.orders.find({ userId: `${req.session.user._id}` });

    let myOrderId = await orders[0]?.orders.reverse();
    myOrderId = myOrderId[0]._id;
    console.log("my order id iss" + myOrderId);
    cartHelpers
      .changePaymentStatus(myOrderId, req.session.user._id)
      .then(() => {
        res.send({ status: true });
      })
      .catch(() => {
        console.log("error while updating payament status");
      });
  },
};
