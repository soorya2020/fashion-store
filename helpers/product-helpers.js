const db = require("../model/connection");
const { response } = require("../app");

module.exports = {
  addProducts: async (product) => {
    product.price = parseInt(product.price);
    try {
      const data = await db.products(product);
      console.log(data, "this is data");
      data.save();
      return data._id;
    } catch (error) {
      throw error;
    }
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.products.find({});
      resolve(products);
    });
  },
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.products.deleteOne({ _id: prodId }).then(() => {
        resolve();
      });
    });
  },
  getProductDetails: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await db.products.findOne({ _id: prodId }).then((product) => {
        resolve(product);
      });
    });
  },
  editProduct: (prodId, data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      let dbprodData = await db.products.findOne({_id:prodId})
      if(data.img.length==0){
        data.img=dbprodData.img
      }
      await db.products.updateOne(
        { _id: prodId },
        {
          name: data.name,
          price: data.price,
          offerPrice:data.offerPrice,
          offerPercentage:data.offerPercentage,
          category: data.category,
          stock: data.stock,
          description: data.description,
          img:data.img
          // img:data.img
        }
      );
      resolve(data);
    });
  },
  addMainBanner:(bannerData)=>{
    return new Promise(async(resolve,reject)=>{
        let data = await db.banners(bannerData)
        await data.save()
        resolve()
    })
  },
  getBanners:()=>{
    
      return new Promise((resolve,reject)=>{
        db.banners.find({}).then((data)=>{
          resolve(data)
        }).catch((error)=>{
          console.log(error);
        })
      })
   
  }
};
