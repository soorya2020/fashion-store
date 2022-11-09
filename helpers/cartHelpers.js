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
                count=cart.products.length
            }
            resolve(count)
        })
    }
}
