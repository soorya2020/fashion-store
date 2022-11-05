const db = require('../config/connection')

const bcrypt = require('bcrypt')
const { users } = require('../config/connection')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            db.users.find({ email: userData.email }).then(async (data) => {
                let response={}
                if (data.length!=0) {
                    resolve({status:false})
                } else {
                    userData.password = await bcrypt.hash(userData.password, 10)
                    let data=await db.users(userData)
                    data.save()
                        response.value = userData
                        response.status = true
                        response.data = data.insertedId
                        resolve(response)
                    


                }
            })



        })
    },
    doLogin: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            let loginStatus = false

            let response = {}
            let user = await db.users.findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        
                        console.log('login succes')
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('password failed');
                        resolve({ status: false })
                    }
                })

            } else {
                console.log('login failed not an existing user');
                resolve({ status: false })
            }
        })
    },

}