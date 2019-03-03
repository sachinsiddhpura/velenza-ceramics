var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads/');
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString() + file.originalname);
    }
})
var upload = multer({storage});
var Product = require('../models/product');
var User = require('../models/user');
var Cart = require('../models/cart');


/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find((err, docs)=>{
    var productChunks = [];
    var chunksize = 3;
    for(var i=0;i<docs.length;i += chunksize){
      productChunks.push(docs.slice(i, i+chunksize));
    }
    res.render('shop/index', { title: 'Velenza ceramic', products: productChunks });
  }); 
});

//search box
router.get('/search', (req, res, next)=>{
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Product.find({title: regex}, (err, docs)=>{
      if(err){
        return console.log(err);
      }
      if(docs.length < 1){
        var msg = "Didn't match with any products, Try again!";
      }
      var productChunks = [];
      var chunksize = 3;
      for(var i=0;i<docs.length;i += chunksize){
        productChunks.push(docs.slice(i, i+chunksize));
      }
      
      res.render('shop/index', {title: 'Velenza ceramic', products: productChunks, errors: msg });
    });
  }else{
    res.redirect('/');
  }
})

//add-to-cart route
router.get('/add-to-cart/:id', (req, res, next)=>{
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

  Product.findById(productId, (err, product)=>{
    if(err){
      console.log(err);
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');
  });
});

//shopping cart route
router.get('/shopping-cart', (req,res,next)=>{
  try {
    if(!req.session.cart){
     return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart',{products: cart.generateArray(),totalPrice: cart.totalPrice});
  } catch (error) {
   console.log(error);
  }
});


// remove one from cart

router.get('/remove-one-cart/:id', (req, res,next)=>{
  try {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});
  
    Product.findById(productId, (err, product)=>{
      if(err){
        console.log(err);
        return res.redirect('/');
      }
      cart.pop(product, product.id);
      req.session.cart = cart;
      res.render('shop/shopping-cart', {products: cart.generateArray(),totalPrice: cart.totalPrice});
    });
  } catch (error) {
    return res.render('shop/shopping-cart')
  }
})

//GET request for CALCULATOR
router.get('/calculator', (req, res, next)=>{
  res.render('shop/calculator');
});


//regex function for fuzzy searching
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//export code
module.exports = router;
