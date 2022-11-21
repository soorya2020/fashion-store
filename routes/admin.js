// const { products } = require('../config/connection');
var express = require('express');
const { render } = require('../app');
const adminHelpers = require('../helpers/adminHelpers');
const router = express.Router();

const multer= require('multer')

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/product-images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ '-' + file.originalname)
    }
});
 const upload = multer({ storage: storage });
// handle storage using multer
// const storage2 = multer.diskStorage({
//   destination: (req, file, cb) => {
//       cb(null, 'public/images/brand')
//   },
//   filename: (req, file, cb) => {
//       cb(null, Date.now()+ '-' + file.originalname)
//   }
// });
// const upload2 = multer({ storage: storage2 });
// module.exports= {
//   upload,
//   upload2
// };


const {
  getAddProducts,
  dashboard,
  addProducts,
  viewProducts,
  deleteProduct,
  getEditProduct,
  postEditProduct}=require('../controllers/productManagment')
const {
  viewAllUsers,
  getAddUser,
  postAddUser,
  blockUser,
  unBlockUser}=require('../controllers/userManagement')
const {
  viewAllCategories,
  getAddCategory,
  postAddCategory,
  getEditCategory,
  postEditCategory,
  deleteCategory}=require('../controllers/categoryManagement')

const {
  viewAllOrders,
  viewOrderDetails,
  updateOrderStatus
}=require('../controllers/orderManagement')
const layout = 'admin-layout'


/*----------------------middlevare to check admin login--------------------------------*/
const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

//admin-login
router.get('/login',(req,res)=>{
  if(req.session.adminLoggedIn){
    res.redirect("/admin")
  }
  res.render('admin/login',{admin:true})
})

router.post('/login',(req,res)=>{
 
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn=true
      req.session.admin=response.admin
      res.send({value:'success'})
    }else{
      req.session.loginErr=true
      res.send({value:'failed'})
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.adminLoggedIn=false
  res.redirect('/admin/login')
})




// dashboard
router.get('/',verifyAdminLogin, dashboard);


// products
router.get('/products',verifyAdminLogin ,viewProducts)
//add-products
router.get('/add-products', verifyAdminLogin,getAddProducts)
router.post('/add-products',upload.array('image') ,addProducts)
//delete product
router.get('/delete-products/:id', deleteProduct)
//edit product
router.get('/edit-products/:id',getEditProduct)
router.post('/edit-products/:id', postEditProduct)


// users
router.get('/users', verifyAdminLogin,viewAllUsers)
//block user
router.get('/blockUser/:id', blockUser)
router.get('/unBlockUser/:id', unBlockUser)
//add user
// router.get('/add-users',getAddUser)
// router.post('/add-user',postAddUser)


// categories
router.get("/categories",verifyAdminLogin,viewAllCategories)
//add category
router.get('/add-category',getAddCategory)
router.post("/add-category",postAddCategory)
//edit category
router.get("/edit-category/:id",getEditCategory)
router.post("/edit-category/:id",postEditCategory)
//delete category
router.get("/delete-category/:id",deleteCategory)

//orders
router.get('/orders',verifyAdminLogin,viewAllOrders)
router.get("/single-order/:id",verifyAdminLogin,viewOrderDetails)

router.post('/update-order-status',verifyAdminLogin,updateOrderStatus)




module.exports = router;
