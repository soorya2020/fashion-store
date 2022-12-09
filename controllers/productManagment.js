var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/product-helpers');
const cartHelpers = require('../helpers/cartHelpers');
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
      console.log(req.body,"this is my producst");
        adminHelpers.getAllCatagories().then((category)=>{
          res.render('admin/add_product',{layout,category})
        })
        
      },

    
    addProducts:(req, res) => {
      const files = req.files
      const fileName = files.map((file) => {
        return file.filename
      })
      const product = req.body
      product.img = fileName

      productHelpers.addProducts(product).then((response)=>{
        res.redirect('/admin/products')
      })

     
      
      },

    deleteProduct:(req, res) => {
        let prodId = req.params.id
        cartHelpers.removeProduct(prodId)
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
     
      console.log(req.body,'this ismy body')
      const files=req.files
      console.log(files);
      // const fileName=files?.map((file)=>{
      //   return file.filename
      // })
      // const product=req.body
      // product.img=fileName

      // productHelpers.editProduct(req.params.id, req.body).then((d)=>{
      //     // res.redirect('/admin/products')
       
      // res.redirect('/admin/products')
      //     // if(req?.files?.image){
      //     //    let image =req.files.image
      //     //   const imgName =req.params.id 
      //     //   image.mv('./public/product-images/'+imgName+'.jpg')
      //     // }
      //   })
      res.redirect('/admin/products')
      },

      

    

    

    
    

    

    
}