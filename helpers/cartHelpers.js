const db = require('../model/connection')
const { response } = require('../app');
const { products, orders } = require('../model/connection');
const ObjectId = require('mongodb').ObjectID;

const Razorpay = require('razorpay');
const { resolve } = require('node:path');
var instance = new Razorpay({
    key_id: 'rzp_test_tUZpCht97wF71G',
    key_secret: 'ggez8hbKtN3dnEXjRWW6XqZg',
  });

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
    
            if(data.count==-1 && data.quantity==1){
          
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
    getAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let address=await db.addresses.find({userId:userId})
            resolve(address)
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
        
    },
    deleteCart:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.carts.updateMany(
                {
                    
                }
            )
        })
    },
    placeOrder:(order,total)=>{
       
        return new Promise(async(resolve,reject)=>{
            let products=await db.carts.aggregate([
                {
                    $match:{user:order.userId}
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
                        as:'cartItemsResult'
                    }
                },
                {
                    $unwind:'$cartItemsResult'
                },
                {
                    $set:{cartItemsResult:{status:true}}
                },
                {
                    $project:{
                        _id:'$cartItemsResult._id',
                        quantity:1,
                        productsName:'$cartItemsResult.name',
                        productsPrice:'$cartItemsResult.price',
                        orderStatus:'$cartItemsResult.status'
                        }
                }
            ])
          
           
            
            let addressData={

                firstName:order.firstname,
                lastName:order.lastname,
                street:order.street,
                country:order.country,
                town:order.town,
                state:order.state,
                pincode:order.pincode,
                mobile:order.mobile,
                email:order.email
                
            }
         
            let addressObj={                      
                userId:order.userId,
                address:addressData
            }
        
            let addressExist= await db.addresses.find({userId:order.userId})
           
            if(!addressExist.length==0){
                
                db.addresses.find(
                    {
                        "address.street":order.street,
                        "address.pincode":order.pincode,
                    }
                    ).then((res)=>{
                
                    if(res.length==0){
                        // db.addresses(addressObj).save()
                        db.addresses.updateOne(
                            {
                                userId:order.userId
                            },
                            {
                                $push:{address:addressData}
                            } 
                        ).then((data)=>{
                          
                        })
                    }
                })
            }else{
                data=await db.addresses(addressObj)
                data.save()
            }


            let orderAddress={
                appartment:order.appartment,
                street:order.street,
                town:order.town,
                country:order.country,
                state:order.state,
                pincode:order.pincode,
                mobile:order.mobile,
                email:order.email
            }

            let orderData={
                firstName:order.firstname,
                lastName:order.lastname,
                mobile:order.mobile,
                paymentMethod:order.paymentMethod,
                productDetails:products,
                totalPrice:total,
                shippingAddress:orderAddress,
                createdAt:new Date(),
            }

            let orderObj={
                userId:order.userId,
                orders:[orderData]
                
            }
          
            
            let orderExist=await db.orders.findOne({userId:order.userId})
            if(orderExist){
                db.orders.updateOne(
                    {
                        userId:order.userId
                    },
                    {
                        $push:{orders:orderData}
                    } 
                ).then((data)=>{
                    // console.log(data,"pushe");
                })
            }else{
                let data=db.orders(orderObj)
                await data.save()
            }
            db.carts.deleteMany({}).then((res)=>{
                resolve()
            })
                
        })
    },

    
    listAddress:(userId,addressId)=>{
        return new Promise((resolve,reject)=>{
            db.addresses.aggregate([
                {
                    $match:{userId:userId}
                },
                {
                    $unwind:'$address'
                },
                {
                    $match:{
                        'address._id':ObjectId(addressId)
                    }
                }
                
            ]).then((data)=>{
                resolve(data)
            })
            
        })
    },


    getOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.orders.find({userId:userId})
            console.log(orders);
            resolve(orders[0])
        })
    },
    cancelOrder:(orderId,prodId)=>{
        return new Promise(async(resolve,reject)=>{
            let order=await db.orders.find({'orders._id':orderId})
           
            if(order){
                console.log(order,"test1");
                let orderIndex=order[0].orders.findIndex(order=>order._id==orderId)
                let productIndex=order[0].orders[orderIndex].productDetails.findIndex(product=>product._id==prodId)
                console.log("orderIndex",orderIndex);
                console.log("productIndex",productIndex);

           

                db.orders.updateOne(
                    {
                        'orders._id':orderId
                    },
                    {
                        $set:{
                           ['orders.'+orderIndex+'.productDetails.'+productIndex+'.orderStatus']:false
                        }
                    }
                    
                    
                    ).then((data)=>{
                        console.log(data);
                        resolve({status:true})
                    })
            }

        })
    },

    generateRazorpay:async(userId,total)=>{
        console.log(userId);
        let data = userId
        let orders=await db.orders.find({userId:`${data}`})
            console.log(orders,"this is ir");
            let myOrderId =await orders[0].orders.slice().reverse(); 
            myOrderId = myOrderId[0]._id; 
            
            return new Promise((resolve,reject)=>{
                var options = {
                    amount: total*100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: ""+myOrderId
                  };
                  instance.orders.create(options, function(err, order) {
                    console.log(order,"new order raxorpay");
                    resolve(order)
                  });
            })
        
        
    },

    verifyPayment:(details)=>{
      
        return new Promise(async(resolve,reject)=>{
            const {
                createHmac
              } = await import('node:crypto');

              let hmac = createHmac('sha256', 'ggez8hbKtN3dnEXjRWW6XqZg');
              hmac.update(details['payment[razorpay_order_id]']+'|'+ details['payment[razorpay_payment_id]']);
              hmac=hmac.digest("hex")
            
              if(hmac==details['payment[razorpay_signature]']){
                resolve()
              }else{
                console.log('elsre of verify payment');
                reject()
              }
        })
    },

    changePaymentStatus:(orderId)=>{
       
  
        return new Promise(async(resolve,reject)=>{
            let orders=await db.orders.find({'orders._id':orderId})
            
           
            let orderIndex=orders[0].orders.findIndex(order=>order._id==orderId)
                

            db.orders.updateOne(
                {
                    'orders._id':orderId
                },
                {
                    $set:{
                        ['orders.'+orderIndex+'.paymentStatus']:1
                    }
                }
            ).then(()=>{
                resolve()
            })
           
        })
    }

}

