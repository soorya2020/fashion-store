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
        let user=req.session.user
        cartHelpers.getAllOrders().then((orders)=>{
           
            res.render('admin/orders',{orders,layout,user})
        })
    },
    viewOrderDetails:(req,res)=>{
        cartHelpers.getOrderById(req.params.id,req.session.user._id).then((orders)=>{
        
            res.render('admin/single-order-details',{layout,orders})
        })
    },
    updateOrderStatus:(req,res)=>{
        cartHelpers.updateOrderStatus(req.body.value,req.body.orderId,req.body.prodId).then((response)=>{
            console.log('succeffully updated order status');
            res.send(response)
        })
    }
}