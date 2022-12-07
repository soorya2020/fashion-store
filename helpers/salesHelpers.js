const db = require("../model/connection");

exports.getRevenueByDay= () => {

        try {
            let date = new Date()

            let thismonth = date.getMonth()
            let month = thismonth + 1
            let year = date.getFullYear()

            return new Promise((resolve, reject) => {

                db.orders.aggregate([
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.createdAt': {
                             $gt: new Date(`${year}-${month}-01`), 
                             $lt: new Date(`${year}-${month}-31`) 
                            } }
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 4 }
                    },
                    {
                        $group: {
                            _id: { '$dayOfMonth': '$orders.createdAt' },
                            totalRevenue: { $sum: { $multiply: ['$orders.productDetails.productsPrice', '$orders.productDetails.quantity'] } },
                            orders: { $sum: 1 },
                            totalQuantity: { $first: '$orders.totalQuantity' }
                        }
                    },
                    {
                        $sort: {
                            '_id': 1
                        }
                    }

                ]).then((data) => {
                    // for(let i=0;i<=data.length;i++){
                    //     if(data[i]._id!=i+1){
                    //         data[i]={
                    //             _id:i+1,
                    //             totalRevenue:data[i].totalRevenue,
                    //             orders:data[i].orders,
                    //             totalQuantity:data[i].totalQuantity
                    //         }
                    //     }else{
                            
                    //     }
                    // }
                    
                    resolve(data)
                }).catch((e) => {
                    console.log('error in catch');
                })
            })
        } catch (error) {
            console.log(error);
        }
    }

exports.getRevenueByear =()=>{

        try {
            let date = new Date()

            let thismonth = date.getMonth()
            let month = thismonth + 1
            let year = date.getFullYear()

            return new Promise((resolve, reject) => {

                db.orders.aggregate([
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.createdAt': { $gt: new Date(`${year - 5}-${month}-01`), $lt: new Date(`${year}-${month}-31`) } }
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 4 }
                    },
                    {
                        $group: {
                            _id: { '$year': '$orders.createdAt' },
                            totalRevenue: { $sum: { $multiply: ['$orders.productDetails.productsPrice', '$orders.productDetails.quantity'] } },
                            orders: { $sum: 1 },
                            totalQuantity: { $first: '$orders.totalQuantity' }
                        }
                    },
                    {
                        $sort: {
                            '_id': 1
                        }
                    }

                ]).then((data) => {

                    resolve(data)
                }).catch((e) => {
                    console.log('error in catch');
                })
            })
        } catch (error) {
            console.log(error);
        }
    }



exports.monthWiseSales= () => {

    return new Promise(async (resolve, reject) => {
        try {
            let data = []
            for (let i = 0; i < 12; i++) {
                await db.orders.aggregate([
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 4 }
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $month: '$orders.createdAt'
                                    },
                                    i + 1
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.productDetails.quantity' },
                            count: { $sum: 1 }
                        }
                    },

                ]).then((monthlyData) => {

                    data[i + 1] = monthlyData[0]

                })


            }

            for (let j = 0; j < 12; j++) {

                if (data[j + 1] == undefined) {
                    data[j + 1] = {
                        _id: null,
                        total: 0,
                        orders: 0,
                        count: 0
                    }
                } else {
                    data[j]
                }
            }

            resolve(data)
        } catch (error) {
            console.log(error);
        }
    })
}


// monthlySales: () => {
    //     let date = new Date()
    //     let thisMonth = date.getMonth()

    //     return new Promise((resolve, reject) => {
    //         try {
    //             db.orders.aggregate([
    //                 {
    //                     $unwind: "$orders"
    //                 },
    //                 {
    //                     $unwind: '$orders.productDetails'
    //                 },
    //                 {
    //                     $match: { 'orders.productDetails.orderStatus': 4 }
    //                 },
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $eq: [
    //                                 {
    //                                     $month: '$orders.createdAt'
    //                                 },
    //                                 thisMonth + 1
    //                             ]
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $group: {
    //                         _id: null,
    //                         total: { $sum: '$orders.totalPrice' },
    //                         orders: { $sum: '$orders.productDetails.quantity' },
    //                         // totalOrders:{$sum:"$orders.totalQuantity"},
    //                         count: { $sum: 1 }


    //                     }
    //                 }
    //             ]).then((data) => {

    //                 resolve(data)
    //             })
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     })
    // },