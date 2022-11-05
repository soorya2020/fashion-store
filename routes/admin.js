var express = require('express');
const { render } = require('../app');
const { products } = require('../config/connection');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/product-helpers');

const router = express.Router();
const layout = 'admin-layout'

/*------------------------admin login------------------------------*/
router.get('/login',(req,res)=>{
  res.render('admin/login')
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
  req.session.destroy()
  res.redirect('/admin/login')
})




/*------------------------------------------------------*/
const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};
/* GET users listing. */
router.get('/',verifyAdminLogin, function (req, res, next) {
  res.render('admin/admin_page', {
    layout
  })
});

router.get('/add-products', (req, res) => {
  adminHelpers.getAllCatagories().then((category)=>{
    res.render('admin/add_product',{layout,category})
  })
  
})


// router.get('/edit-products/:id', async(req, res) => {
//   let products = await productHelpers.getProductDetails(req.params.id)
//   adminHelpers.getAllCatagories().then((category)=>{
//     res.render('admin/edit-products', {products,layout,category})
//   })
    
  
// })


/*------------------------add-product------------------------------*/


router.post('/add-products', (req, res) => {

  productHelpers.addProducts(req.body).then((insertedId) => {
    let image = req.files.image
    const imgName = insertedId;
    console.log(imgName);

    image.mv('./public/product-images/' + imgName + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/products')
      } else {
        console.log(err)
      }
    })

  })

})

/*------------------------products------------------------------*/


router.get('/products', (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/products', {
      products: products,
      layout: layout
    })
    // console.log(products)
  })
})


/*------------------------delete-product------------------------------*/


router.get('/delete-products/:id', (req, res) => {
  let prodId = req.params.id
  productHelpers.deleteProduct(prodId).then(() => {
    res.redirect('/admin/products')
  })
})


/*------------------------edit-product------------------------------*/


router.get('/edit-products/:id', async(req, res) => {
  let products = await productHelpers.getProductDetails(req.params.id)
  adminHelpers.getAllCatagories().then((category)=>{
    res.render('admin/edit-products', {products,layout,category})
  })
    
  
})

router.post('/edit-products/:id', (req, res) => {
  productHelpers.editProduct(req.params.id, req.body).then((data)=>{
    res.redirect('/admin/products')
  })
})


/*------------------------adduser------------------------------*/

router.get('/add-users',(req,res)=>{
  res.render('admin/add_user',{
    layout
  })
})

router.post('/add-user',(req,res)=>{
  adminHelpers.addUser(req.body).then((data)=>{
    res.redirect('/admin/users')
  })
})

//--------------------------bolok user---------------------------//



router.get('/blockUser/:id', (req, res) => {
  adminHelpers.blockUser(req.params.id).then((user)=>{
    console.log(user);
    req.session.loggedIn=false
    res.redirect("/admin/users")
  })
  
})
router.get('/unBlockUser/:id', (req, res) => {
  adminHelpers.unBlockUser(req.params.id).then((user)=>{
    console.log(user);
    res.redirect("/admin/users")
  })
  
})

//-----------------------------------------------------//
router.post('/edit-products/:id', (req, res) => {
  productHelpers.editProduct(req.params.id, req.body).then((data)=>{
    res.redirect('/admin/products')
  })
})


//--------------------------add products---------------------------//
router.get('/add-products', (req, res) => {
  res.render('admin/add_product', {
    layout
  })
})


router.get('/users', (req, res) => {
  adminHelpers.getAllUsers().then((users)=>{
    console.log(users);
    res.render("admin/users",{users,layout})
  })
  
})

//--------------------------show categories---------------------------//
router.get("/categories",(req,res)=>{
  adminHelpers.getAllCatagories().then((category)=>{
    console.log(category);
    res.render('admin/categories',{category,layout})
  })
})

//--------------------------add categories---------------------------//

router.get('/add-category',(req,res)=>{
  res.render('admin/add-category',{
    layout
  })
})

router.post("/add-category",(req,res)=>{
  adminHelpers.addCategory(req.body).then((data)=>{
    res.redirect("/admin/categories")
  })
})


//--------------------------edit categories---------------------------//
router.get("/edit-category/:id",(req,res)=>{
  adminHelpers.getCategoryDetails(req.params.id).then((category)=>{
    res.render('admin/edit-category',{layout,category})
  })
})

router.post("/edit-category/:id",(req,res)=>{
  adminHelpers.editCategory(req.params.id,req.body).then(()=>{
    res.redirect("/admin/categories")
  })
})

router.get("/delete-category/:id",(req,res)=>{
  adminHelpers.deleteCategory(req.params.id).then(()=>{
    res.redirect("/admin/categories")
  })
})





module.exports = router;
