// const { products } = require('../config/connection');
var express = require('express');
const { render } = require('../app');
const adminHelpers = require('../helpers/adminHelpers');
const router = express.Router();

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
router.post('/add-products', addProducts)
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




module.exports = router;
