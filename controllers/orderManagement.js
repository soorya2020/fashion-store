var express = require('express');
const { render } = require('../app');
const { products } = require('../model/connection');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/product-helpers');
const cartHelpers = require('../helpers/cartHelpers');


const router = express.Router();
const layout = 'admin-layout'


module.exports={
    viewAllOrders:(req,res)=>{
        let userId=req.session.user._id
        cartHelpers.getOrders(userId).then((orders)=>{
           
            res.render('admin/orders',{orders,layout})
        })
    }
}