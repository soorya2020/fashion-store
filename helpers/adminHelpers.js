const db = require('../config/connection')
const { response } = require('../app')
const  bcrypt = require('bcrypt')
const { ObjectID } = require('bson')
const data=require('../config/adminpass')


module.exports={
    doLogin:(userData)=>{
        return new Promise(async(resolve, reject) => {
         
         //   data.password = await bcrypt.hash(userData.password,10)
         //   console.log(data.password);
           if(data.email == userData.email){
              bcrypt.compare(userData.password, data.password).then((loginTrue)=>{
                 let response={}
                 if(loginTrue){
                    console.log('login successful');
                    response.admin=data;
                    response.status=true;
                    resolve(response);
                 }else{
                    console.log("login failed");
                    resolve({status:false});
                 }
              })
           }else{
              console.log('Login failed email');
               resolve({status:false});
           }
           
        })
   },
    addUser:(userData)=>{
        
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            let data=await db.users(userData)
            data.save()
            resolve(data._id)
            })
           
        
    },
    getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
        let user=await db.users.find({})
        resolve(user)
    })
},


blockUser:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
             db.users.updateOne({_id:userId},{
                $set:{
                    status:false
                }
            }).then((data)=>{
                resolve(data)
            })
            
        } catch(error){
            console.log(error);
        }
    })
},

unBlockUser:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            await db.users.updateOne({_id:userId},{
                $set:{
                    status:true
                }
            }).then((data)=>{
                resolve(data)
            })
            
        } catch(error){
            console.log(error);
        }
    })
},

getAllCatagories:()=>{
    return new Promise((resolve,reject)=>{
        let categories=db.categories.find({})
        resolve(categories)
    })
},

addCategory:(category)=>{
        
    return new Promise(async(resolve,reject)=>{
        
        let data=await db.categories(category)
        data.save()
        resolve(data)
        })
       
},

getCategoryDetails:(categoryId)=>{
    return new Promise((resolve,reject)=>{
        db.categories.findOne({_id:categoryId}).then((category)=>{
            resolve(category)
        })
    })
},

editCategory:(categoryId,data)=>{
    return new Promise(async(resolve,reject)=>{
       await db.categories.updateOne({_id:categoryId},{
            $set:{
                name:data.name
            }
        })
        resolve(data)
    })
},

deleteCategory:(categoryId)=>{
    return new Promise((resolve,reject)=>{
        db.categories.findByIdAndDelete({_id:categoryId}).then((data)=>{
            resolve()
        })
    })
}

}

