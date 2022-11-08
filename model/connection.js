const mongoose=require('mongoose')

//db connection
const db=mongoose.createConnection("mongodb://localhost:27017/tshirts")
db.on("error",(err)=>{
    console.log(err);
})
db.once("open",()=>{
    console.log("database connected");
})


//product schema
const productSchema=new mongoose.Schema({
    name:String,
    price:Number,
    category:String,
    quantity:Number,
    description:String
})

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
    mobile:String
})

//catergory schema
const catergorySchema=new mongoose.Schema({
    name:String
})

module.exports={
    products:db.model("product",productSchema),
    users:db.model("user",userSchema),
    categories:db.model("catergory",catergorySchema)
}