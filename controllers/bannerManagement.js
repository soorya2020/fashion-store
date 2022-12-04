var express = require('express');
const layout = 'admin-layout'
const productHelpers=require('../helpers/product-helpers')
const db = require("../model/connection");
module.exports={
    getBanner:async(req,res)=>{
        let banners=await db.banners.find({})
        res.render('admin/banner',{layout,banners})
    },
    getMainBanner:(req,res)=>{
        res.render('admin/mainBanner',{layout})
    },
    addMainBanner:(req,res)=>{
        const files=req.files
        const fileName=files.map((file)=>{
            return file.filename
        })
        const bannerData=req.body
        bannerData.image=fileName
        console.log(bannerData,'this is my data');
        productHelpers.addMainBanner(bannerData).then(()=>{
            res.redirect('/admin/banner')
        })
        
    }
}