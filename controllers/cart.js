require("dotenv").config();
const productHelpers = require("../helpers/product-helpers");
const cartHelpers = require("../helpers/cartHelpers");
const config = require("../config/otpconfig");

const { v4: uuidv4 } = require("uuid");
const db = require("../model/connection"); //trial

const paypal = require("@paypal/checkout-server-sdk");
const couponHelpers = require("../helpers/couponHelpers");
const { coupon } = require("./orderManagement");
const { ObjectId } = require("mongodb");
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
let  couponAmount=0

module.exports = {
  getHome: async function (req, res) {
    productHelpers.getBanners().then((banners) => {
      res.render("index", { nav, footer, banners: banners });
    });
  },
  getCart: async (req, res) => {
    let cartCount = await cartHelpers.getCartCount(req?.session?.user?._id);

    let totalAmount = await cartHelpers.getTotalAmount(req?.session?.user?._id);
    let total = totalAmount?.total;
    let mrpTotal = totalAmount?.mrpTotal;
    cartHelpers.getCartProducts(req?.session?.user?._id).then((cartItems) => {
      res.render("user/cart", {
        cartItems,
        user: req.session.user,
        cartCount,
        total,
        mrpTotal,
        nav,
      });
    });
  },
  findProdQuantity: (req, res) => {
    let prodId = req.params.id;
    cartHelpers.findQuantity(prodId, req.session.user._id).then((quantity) => {
      res.json(quantity);
    });
  },
  addToCart: (req, res) => {
    cartHelpers
      .addToCart(req.params.id, req.session.user._id)
      .then((quantity) => {
        console.log(quantity, "soorya");
        res.json({ status: true });
      });
  },
  changePrdQty: (req, res) => {
    cartHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await cartHelpers.getTotalAmount(req.session.user._id);
      response.total=response?.total?.total//changed

      res.json(response);
    });
  },
  deleteProduct: (req, res) => {
  
    cartHelpers.removeProduct(req.body).then((response) => {
      res.json(response);
    }).catch((error)=>{
      res.json()
    });
  },
  getCheckout: async (req, res) => {
    let cartProducts = await cartHelpers.getCartProducts(req.session.user._id);
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
    console.log(total);
    let totalAmount=total?.total
    let address = await cartHelpers.getAddress(req.session.user._id);
    let coupons= await couponHelpers.getAllCoupons()

    res.render("user/checkout", {
      total: totalAmount,
      user: req.session.user,
      address,
      cartProducts,
      nav,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      coupons
    });
  },
  postCheckout: async (req, res) => {
    req.body.userId=req.session.user._id
    console.log(couponAmount,'this is my coupon amount');
      let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
      totalPrice = totalAmount?.total;
      console.log(totalPrice,"total before offer");
      totalPrice=totalPrice-couponAmount
      console.log(totalPrice,"total after offer");
    if (totalPrice == 0) {
      req.session.coupon=''
      res.json({ status: true });
    } else {
      cartHelpers.placeOrder(req.body, totalPrice).then(async (response) => {
        // if (response?.outOfStock) {
        //   req.session.coupon=''
        //   res.json(response);
        // } else {
          if (req.body.paymentMethod === "COD") {
            let orders = await db.orders.find({ userId: req.session.user._id })
            console.log(orders,'soorya');
            let myOrderId = orders[0]?.orders.reverse();
            myOrderId = myOrderId[0]?._id;
            cartHelpers
              .changePaymentStatus(myOrderId, req.session.user._id,0)
              .then(() => {
                req.session.coupon=''
                res.json({ cod: true });
              });
          } else if (req.body.paymentMethod === "UPI") {
            cartHelpers
              .generateRazorpay(req.session.user._id, totalPrice)
              .then((response) => {
                req.session.coupon=''
                res.json(response);
              });
          } else if (req.body.paymentMethod === "PAYPAL") {
            req.session.coupon=''
            res.json({ paypal: true, totalPrice: totalPrice });
          }
      // }
      });
    }
  },
  getOrders: (req, res) => {
    let userId = req.session.user._id;
    cartHelpers.getOrders(userId).then((orders) => {
     
      // res.render("user/orders", { nav, orders });
      res.render("user/neworder", { nav, orders });
    });
  },
  getOrderDetails: (req, res) => {
    let orderId = req.params.id;
    let userId = req.session.user._id;
    cartHelpers.getOrderDetails(orderId, userId).then((d) => {
      res.send(d[0]);
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
    console.log(req.body,'payment verification');
    cartHelpers
      .verifyPayment(req.body)
      .then(() => {
        console.log(req.body["order[receipt]"]);
        console.log("thsis is orsdr id");
        cartHelpers
          .changePaymentStatus(req.body["order[receipt]"], req.session.user._id,1)
          .then(() => {
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
  retunProduct: (req, res) => {
    cartHelpers.retunItem(req.body, req.session.user._id).then((response) => {
      res.send(response);
    });
  },
  addToWishlist: (req, res) => {
    productHelpers
      .addToWishlist(req.session.user._id, req.params.id)
      .then((response) => {
        res.send(response);
      });
  },
  getWishlist: (req, res) => {
    productHelpers
      .getWishlistProducts(req.session.user._id)
      .then((products) => {
        res.render("user/wishlist", { nav, products });
      });
  },
  removeFromWishlist:(req,res)=>{
    console.log('soorya');
    productHelpers.removeFromWishlist(req.session.user._id,req.params.id).then(()=>{
      res.send({status:true})
    }).catch((e)=>{
      res.send({status:false})
    })
  },
  applyCoupon:async(req,res)=>{
    req.session.coupon=req.body._id
    let couponId=req.body._id
    let totalAmount=await cartHelpers.getTotalAmount(req.session.user._id)
    let total=totalAmount?.total
    couponHelpers.getCoupon(couponId).then((data)=>{
      if(total>=data.minPurchase){
        //add coupon to user

        couponHelpers.addCouponToUser(req.session.user._id,ObjectId(req.body._id),false).then((d)=>{
          
          if(total*data.discountPercentage/100 <=data.maxDiscountValue){
  
            console.log(total*data.discountPercentage/100,'thsi is my discount value')
            let couponTotal=total*data.discountPercentage/100
            // couponHelpers.applyCoupon(couponAmount)
            couponAmount=couponTotal
            res.send({status:true,couponAmount:couponTotal,couponId:data._id})
  
          }else{
            couponAmount=data.maxDiscountValue
            // couponHelpers.applyCoupon(couponAmount)
         
            res.send({status:true,couponAmount:couponAmount,offerTotal:total-couponAmount})

          }
        }).catch((e)=>{
          
          res.send({staus:false,message:'Something went wrong'})
        })

      }else{
        res.send({status:false,message:'coupon not applicable'})
      }
    })
  },
}