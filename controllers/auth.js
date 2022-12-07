const config = require("../config/otpconfig");
const userHelpers = require("../helpers/userHelpers");
const client = require("twilio")(config.accountID, config.authToken);
const db = require("../model/connection");

var nav = true;
var footer = true;

module.exports = {
  verifyLogin: (req, res, next) => {
    if (req.session.loggedIn) {
      res.locals.loggedIn = true;
      res.locals.user=req.session.user

      next();
    } else {
      res.redirect("/login");
    }
  },

  getSignup: (req, res) => {
    res.render("user/signup", { nav: false, footer: false });
  },

  signup: (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      if (!response.status) {
        res.send({ value: "failed" });
      } else {
        // req.session.loggedIn = true; 
        res.send({ value: "success" });
      }
    });
    // res.render('user/signup',{nav:false,footer:false})
  },

  getLogin: (req, res) => {
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
  },

  login: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.send({ value: "success" });
      } else if (response.blocked) {
        res.send({ value: "blocked" });
      } else {
        req.session.loginErr = true;
        res.send({ value: "failed" });
      }
    });
  },

  logout: (req, res) => {
    req.session.loggedIn = false;
    req.session.user=''
    res.redirect("/login");
  },

  getOtp: (req, res) => {
    userHelpers.isUser(req.query.phonenumber).then((userExist) => {
      if (userExist) {
        console.log("if is working");
        client.verify
          .services(config.serviceID)
          .verifications.create({
            to: `+91${req.query.phonenumber}`,
            channel: "sms",
          })
          .then((data) => {
            console.log(data);
            res.status(200).send(data);
          })
          .catch((data) => {
            console.log(data);
            res.send({ value: true });
          });
      } else {
        console.log("else is working");
        res.send({ value: false });
      }
    });
  },

  verifyOtp: (req, res) => {
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
  },
  updateUser: async (req, res) => {
    let user = await db.users.findOne({ _id: req.session.user._id });
    userHelpers.updateUserDate(req.body, user).then((response) => {
      if (response?.acknowledged) {
        console.log("reached response");
        res.send({ status: true });
      } else {
        console.log("reached response else");
        res.send({ status: false });
      }
    });
  },
};
