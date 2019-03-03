var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
var Cart = require('../models/cart');

var stripe = require('stripe')('sk_test_WXmBGcfjcRMvLZk4rlyVMxKa');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './uploads/');
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString() + file.originalname);
    }
})

var upload = multer({storage});

var User = require('../models/user');
var CustomProduct = require('../models/customProduct');




router.post('/custom-product', isloggedIn, upload.single('imagePath'), (req, res, next)=>{
 try {
  const product = new CustomProduct({
    name : req.body.title,
    number: req.body.number,
    description: req.body.description,
    price: req.body.price,
    imagePath: req.file.path
  });
  product.save().then((doc)=>{
    console.log('Product added');
  }, (e)=>{
      console.log(e);
      res.redirect('/custom-product');
  });
  res.render('user/custom',{successMessage: 'Your request has been added'});
 } catch (error) {
   console.log(error);
   res.render('user/custom', {dangerMessage: 'Some error occurred'});
 }
})


//POST request for transaction
router.post('/transaction',isloggedIn,(req,res)=>{
    var token = req.body.stripeToken;
    var chargeAmount = req.body.chargeAmount;
    var charge = stripe.charges.create({
      amount: chargeAmount,
      currency: "usd",
      source: token
    },(err,charge)=>{
      if(err ==="StripeCardError"){
        if (err.type==="StripeCardError") {
          console.log("card is Decliend..")
        }
        console.log("Your Card is Decliend..!");
      }
    });
    var cart = new Cart(req.session.cart);
    res.render('shop/checkout', {message: 'Payment successfull', total: cart.totalPrice});
});

router.use(csrfProtection);

router.get('/logout', (req, res, next)=>{
  req.logout();
  res.redirect('/');
});

router.get('/profile',isloggedIn, (req, res, next)=>{
  res.render('user/profile', {user: req.user});
});

router.get('/custom-product', isloggedIn , (req,res,next)=>{
  res.render('user/custom',{token: req.csrfToken()});
});

router.get('/checkout', (req, res, next)=>{
  if(!req.isAuthenticated()){
    return res.render('user/signin', {error: 'You must be logged in for checkout !'})
  }
  if(!req.session.cart){
    return res.status(400).send();
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', {total: cart.totalPrice});
});


router.use('/',notloggedIn, (req, res, next)=>{
  next();
})
//sign up route
router.get('/signup', (req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/signup', {token: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
  });
  
  router.post('/signup', passport.authenticate('local.signup',{
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
  }));



  router.get('/signin', (req,res,next)=>{
    var messages = req.flash('error');
    res.render('user/signin', {token: req.csrfToken(), messages: messages, hasErrors: messages.length >0});
  });
  
  router.post('/signin', notloggedIn , passport.authenticate('local.signin',{
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
  }));

 

  function isloggedIn(req, res, next){
      if(req.isAuthenticated()){
        return next();
      }
      res.redirect('/');
  }

  function notloggedIn(req, res, next){
    if(!req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
}



module.exports = router;
  