const db = require('../config/connection')
const { response } = require('../app')


module.exports={
addProducts: (product) => {
    return new Promise(async(resolve,reject)=>{
        let data=await db.products(product)
        data.save()
        resolve(data._id)
    })  
},

getAllProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.products.find({})
        resolve(products)
    })
},
deleteProduct:(prodId)=>{
    return new Promise((resolve,reject)=>{
        db.products.deleteOne({_id:prodId}).then(()=>{
            resolve()
        })
    })
},
getProductDetails:(prodId)=>{
    return new Promise(async(resolve,reject)=>{
        await db.products.findOne({_id:prodId}).then((product)=>{
            resolve(product)
        })
            
        })
},
editProduct:(prodId,data)=>{
    return new Promise(async(resolve,reject)=>{
        await db.products.updateOne({_id:prodId},
            {
            name:data.name,
            price:data.price,
            category:data.category,
            quantity:data.quantity,
            description:data.description
        })
        resolve(data)
    })
}


}