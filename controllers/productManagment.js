var express = require('express');
const { render } = require('../app');
const { products } = require('../model/connection');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/product-helpers');


const router = express.Router();
const layout = 'admin-layout'


module.exports={
    dashboard:function (req, res, next) {
        res.render('admin/admin_page', {
          layout
        })
      },
      
    viewProducts:(req, res) => {
          productHelpers.getAllProducts().then((products) => {
            res.render('admin/products', {
              products: products,
              layout: layout
            })
            // console.log(products)
          })
        },

    getAddProducts:(req, res) => {
        adminHelpers.getAllCatagories().then((category)=>{
          res.render('admin/add_product',{layout,category})
        })
        
      },

    
    addProducts:(req, res) => {

        productHelpers.addProducts(req.body).then((insertedId) => {
          let image = req.files.image
          const imgName = insertedId;
          // console.log(imgName);
      
          image.mv('./public/product-images/' + imgName + '.jpg', (err, done) => {
            if (!err) {
              res.redirect('/admin/products')
            } else {
              res.send('upload an image')
            }
          })
      
        })
      
      },

    deleteProduct:(req, res) => {
        let prodId = req.params.id
        productHelpers.deleteProduct(prodId).then(() => {
          res.redirect('/admin/products')
        })
      },

    getEditProduct: async(req, res) => {
        let products = await productHelpers.getProductDetails(req.params.id)
        adminHelpers.getAllCatagories().then((category)=>{
          res.render('admin/edit-products', {products,layout,category})
        })
          
        
      },

    postEditProduct:(req, res) => {
        productHelpers.editProduct(req.params.id, req.body).then(()=>{
           let image =req.files.image
          const imgName =req.params.id 
      
          image.mv('./public/product-images/'+imgName+'.jpg',(err,done)=>{
            if(!err){
              res.redirect('/admin/products')
            }else{
              res.send(err)
            }
          })
        })
      },

    

    

    
    

    

    
}