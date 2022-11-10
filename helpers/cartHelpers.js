const db = require('../model/connection')
const { response } = require('../app');
const { products } = require('../model/connection');


module.exports={
    addToCart:(prodId,userId)=>{
        let prodObj={
            item:prodId,
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.carts.findOne({user:userId})
            if(userCart){
                let prodExist=userCart.products.findIndex(product=> product.item==prodId)
                console.log(prodExist)
                if(prodExist!=-1){
                    db.carts.updateOne(
                        {
                            user:userId,
                            "products.item":prodId
                        },
                        {
                            $inc:{"products.$.quantity":1}
                        }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                db.carts.updateOne({user:userId},
                    {
                        
                            $push:{products:prodObj}
                        
                    }
                    ).then((response)=>{
                        resolve()
                    })
                }                
            }else{
                let cartObj={
                    user:userId,
                    products:[prodObj ]
                }
                let data=await db.carts(cartObj)
                data.save((err,data)=>{
                    if(err){
                        console.log(err);
                    }else{
                       
                        resolve(data)
                    }
                })
                 
            }
        })
    },
    //not working
    getCartProducts:(userId)=>{ 
       
        return new Promise((resolve,reject)=>{
            
            db.carts.aggregate([
                {
                    $match:{user:userId}
                },
                {
                    $unwind:'$products' 
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField:'item',
                        foreignField:'_id',
                        as:'productInfo'
                    }
                },
                
                {
                    $project:{item:1,quantity:1,product:{$arrayElemAt:['$productInfo',0]}}
                }
                
            ]).then((productInfo)=>{
                resolve(productInfo)
                })
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.carts.findOne({user:userId})
            console.log(userId);
            if(cart){
                for(i=0;i<cart.products.length;i++){
                    count += cart.products[i].quantity
                }
            }
            count = parseInt(count)
            resolve(count)
        })
    },
    changeProductQuantity:(data)=>{
        
        data.count=parseInt(data.count)
        data.quantity=parseInt(data.quantity)
        
        return new Promise((resolve,reject)=>{
            console.log(data);
            if(data.count==-1 && data.quantity==1){
                console.log('if is woeking');
                db.carts.updateOne(
                    {
                        _id:data.cart, 
                        // "products.item":data.product
                    },
                    {
                        $pull:{products:{item:data.product}}
                    }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
                
                db.carts.updateOne(
                    {
                        _id:data.cart,
                        "products.item":data.product
                    },
                    {
                        $inc:{'products.$.quantity':data.count}                        
                    }
                ).then((response)=>{
                    resolve({status:true})
                })
            }
            
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.carts.aggregate([
                {
                    $match:{user:userId}
                },
                {
                    $unwind:'$products' 
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField:'item',
                        foreignField:'_id',
                        as:'productInfo'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$productInfo',0]}
                        }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }
                }
                
            ]).then((totalAmount)=>{
                
                resolve(totalAmount[0]?.total)
                })
        })
        
    },
    removeProduct:(data)=>{
        return new Promise((resolve,reject)=>{
            db.carts.updateOne(
                {
                    _id:data.cartId, 
                    // "products.item":data.product
                },
                {
                    $pull:{products:{item:data.productId}}
                }
            ).then((response)=>{
                resolve(response)
            })
        })
        
    }
}
