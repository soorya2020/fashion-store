const { ObjectId } = require("mongodb");
const { coupon } = require("../controllers/orderManagement");
const db = require("../model/connection");

module.exports = {
  addCoupon: (data) => {
    try {
      return new Promise(async (resolve, reject) => {
        let couponObj = {
          couponName: data.couponName,
          expiry: data.expiry,
          minPurchase: data.minPurchase,
          description: data.description,
          discountPercentage: data.discountPercentage,
          maxDiscountValue: data.maxDiscountValue,
        };
        console.log(couponObj, "this is my body");
        let couponData = await db.coupons(couponObj);
        await couponData.save();
        resolve();
      });
    } catch (error) {
      console.log(error);
    }
  },
  getAllCoupons: () => {
    return new Promise((resolve, reject) => {
      db.coupons
        .find({})
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  getCoupon: (id) => {
    return new Promise((resolve, reject) => {
      db.coupons
        .findOne({ _id: id })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  addCouponToUser: (userId, coupId, value) => {
    console.log(userId, coupId);
    return new Promise((resolve, reject) => {
      //check coupon already used or not
      db.users
        .aggregate([
          {
            $unwind: "$coupon",
          },
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $match: {
              $and: [{ "coupon.couponId": coupId, status: true }],
            },
          },
        ])
        .then((data) => {      
          if (!data.length) {
            let couponObj = {
              couponId: coupId,
              status: value,
            };
            db.users
              .updateOne(
                {
                  _id: userId,
                },
                {
                  $push: { coupon: couponObj },
                }
              )
              .then(() => {
                resolve();
              })
              .catch((e) => {
                reject();
              });
          } else {
            reject();
          }
        });
    });
  },
  changeCouponStatus:(userId,coupId)=>{
    return new Promise((resolve,reject)=>{
      db.users.aggregate([
        {
          $unwind:'$coupon'
        },
        {
          $match:{_id:userId}
        },
        {
          $match: {
            $and: [{ "coupon.couponId": coupId, status: false }],
          },
        },
        {
          $set:{'coupon.status':true}
        }
      ]).then((d)=>{
        console.log(d,'coupon status updated');
        resolve()
      }).catch((e)=>{
        console.log(e,'error while updating coupon stats');
        reject()
      })
    })
  }
};
