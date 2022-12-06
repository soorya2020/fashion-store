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
      getAllCoupons:()=>{

        return  new Promise((resolve,reject)=>{
          db.coupons.find({}).then((data)=>{
            resolve(data)
          }).catch((error)=>{
            reject(error)
          })
        })
    
    }
};

