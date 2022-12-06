const mongoose=require('mongoose');
const { ObjectID } = require('bson');
const { stringify } = require('uuid');
const { coupon } = require('../controllers/orderManagement');

//db connection
const db=mongoose.createConnection("mongodb://localhost:27017/tshirts")
db.on("error",(err)=>{
    console.log(err);
})
db.once("open",()=>{
    console.log("database connected");
})


//product schema
exports.products=db.model('product',new mongoose.Schema({
    name:String,
    price:Number,
    offerPrice:Number,
    offerPercentage:Number,
    category:String,
    stock:{
        type:Number,
        min:0
    },
    description:String,
    img:Array,
    return:{
        type:Boolean,
        default:false
    }
}))

//user schema
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    status:{
        type:Boolean,
        default:true
    },
    role:{
        type:Number,
        default:0
    },
    password:String,
    mobile:String,
    wallet:Array
})

//catergory schema
const catergorySchema=new mongoose.Schema({
    name:String
})

exports.carts=db.model('cart',new mongoose.Schema({
    user:ObjectID,
    products:[{
        item:ObjectID,
        quantity:Number
        
    }]
        
}))

const wishlistSchema=new mongoose.Schema({
    user:ObjectID,
    products:[{
        item:ObjectID,
        
        
    }]
        
})

const addressSchema=new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    address:[{
        firstName:String,
        lastName:String,
        street:String,
        town:String,
        country:String,
        state:String,
        pincode:Number,
        mobile:Number,
        email:String
    }]
})

module.exports.orders=db.model('order',new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    orders:[
        {
            firstName:String,
            lastName:String,
            mobile:Number,
            paymentMethod:String,
            productDetails:[{}],
            totalPrice:Number,
            totalQuantity:Number,
            shippingAddress:Object,
            paymentStatus:{
                type:Number,
                default:0
            },
            createdAt:{
                type:Date
            },
            status:{
                type:Number,
                default:0  //1 for order plced
            },
            
                          //2 for cancelled
                            //3 for order shipped
        }                   //4 order delovered
                            //5 order returned
    ]
}))

const bannerSchema=new mongoose.Schema({
    title:String,
    subtitle:String,
    description:String,
    offer:String,
    image:Array
})

exports.coupons= db.model("coupons",new mongoose.Schema({
    couponName:String,
    expiry:{
        type:Date
    },
    minPurchase:Number,
    description:String,
    discountPercentage:Number,
    maxDiscountValue:Number
}))


module.exports={
    // products:db.model("product",productSchema),
    users:db.model("user",userSchema),
    categories:db.model("catergory",catergorySchema),
    // carts:db.model('cart',cartSchema),
    addresses:db.model('address',addressSchema),
    // orders:db.model('order',orderSchema),
    banners:db.model('banner',bannerSchema),
    wishlists:db.model('wishlist',wishlistSchema),
    // coupons:db.model("coupons",couponSchema)
}

