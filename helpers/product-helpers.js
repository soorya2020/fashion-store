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
    return new Promise(async (resolve, reject) => {
      await db.products.updateOne(
        { _id: prodId },
        {
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          description: data.description,
        }
      );
      resolve(data);
    });
  },
};
