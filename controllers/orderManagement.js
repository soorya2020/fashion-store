var express = require('express');
const { render } = require('../app');
const { products } = require('../model/connection');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/product-helpers');
const cartHelpers = require('../helpers/cartHelpers');
const salesHelpers = require('../helpers/salesHelpers');


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
    },
    getSalesReport:async(req,res)=>{
        // let yearly=await salesHelpers.yearlySales()
        let monthly=await salesHelpers.monthlySales()
        let monthlyWise=await salesHelpers.monthWiseSales()
        let daily=await salesHelpers.getRevenueByDay()
        let year=await salesHelpers.getRevenueByear()
  
      
        
        res.render('admin/salesReport',{layout,monthlyData:monthly[0],monthlyWise:monthlyWise,dailyWise:daily,yearlyWise:year})
    },
    revenueGraph:async(req,res)=>{
        try {
            let monthly=await salesHelpers.monthWiseSales()
            let yeaely=await salesHelpers.yearlyWise
            let daily=await salesHelpers.getRevenueByDay()
            let year=await salesHelpers.getRevenueByear()
  
            // let yearly=await salesHelpers.yearlyWiseSales()
            res.send({priceStat:monthly,daily:daily,year:year})
        } catch (error) {
            
        }
    },
    coupon:(req,res)=>{
        try {
            res.render('admin/coupon',{layout})
        } catch (error) {
            
        }
    },
    addCoupon:(req,res)=>{
        try {
            res.render('admin/add-coupon',{layout})
        } catch (error) {
            res.send(error)
        }
    },
    addCouponPost:(req,res)=>{
        try {

            
        } catch (error) {
            
        }
    }
}