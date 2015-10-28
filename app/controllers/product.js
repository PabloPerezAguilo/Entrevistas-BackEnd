// Load required packages
var Product = require('../models/product');
var cache = require('../cache/product');
var log4js = require('log4js');
var log = log4js.getLogger("productCtrl");



// Create endpoint /api/products for POST
exports.postProducts = function(req, res) {

  log.debug("postProducts with Content-Type: "+req.get('Content-Type'));
  var isJson=req.is('application/json');
   log.debug("Is JSON: "+isJson);
  // Create a new instance of the Product model
  var product = new Product();

  // Set the product properties that came from the POST data
  product.name = req.body.name;
  product.type = req.body.type;
  product.quantity = req.body.quantity;
  product.userId = req.decoded._id;

  // Save the product and check for errors
  product.save(function(err) {
     log.debug("Execute product.save! :"+JSON.stringify(product));
    if (err)
      res.send(err);
    //post in cache
    // cache.setProduct(product;
    res.json({ message: 'product added!', data: product });
  });
};

// Create endpoint /api/products for GET
exports.getProducts = function(req, res) {
   log.debug("Execute ALL getProducts! ");

  //getProducts in cache
 // res.json(cache.getProducts());
  // Use the Product model to find all product
  Product.find({ }, function(err, products) {
    if (err)
      res.send(err);

    res.json(products);
  });
};

// Create endpoint /api/productsbyuser for GET
exports.getProductsByUser = function(req, res) {
    log.debug("Execute ALL getProductsByUser! ");

    //getProducts in cache
     //res.json(cache.getProductsByUser());

  // Use the Product model to find all product
  Product.find({ userId: req.decoded._id }, function(err, products) {
    if (err)
      res.send(err);

    res.json(products);
  });
};


// Create endpoint /api/products/:product_id for GET
exports.getProduct = function(req, res) {
  log.debug("Execute getProduct!  ID: "+ req.params.product_id );
  
  //getProduct in cache
  //cache.getProduct(product._id);

  // Use the Product model to find a specific product
  Product.find({ _id: req.params.product_id }, function(err, product) {
    if (err)
      res.send(err);

    res.json(product);
  });
};

// Create endpoint /api/productsbyuser/:product_id for GET
exports.getProductByUser = function(req, res) {
    log.debug("Execute getProductByUser! ID: "+req.params.product_id);
  //getProduct in cache
   //cache.getProductByUser(product._id);
  // Use the Product model to find a specific product
  Product.find({ userId: req.decoded._id, _id: req.params.product_id }, function(err, product) {
    if (err)
      res.send(err);

    res.json(product);
  });
};

// Create endpoint /api/products/:product_id for PUT
exports.putProduct = function(req, res) {
  log.debug("Content-Type: "+req.get('Content-Type'));
//putProduct in cache

  // Use the Product model to find a specific product
  Product.update({ userId: req.decoded._id, _id: req.params.product_id }, { quantity: req.body.quantity }, function(err, num, raw) {
    if (err)
      res.send(err);

    //cache.putProduct(product);
    res.json({ message: num + ' updated',productId: req.params.product_id  });
  });
};

// Create endpoint /api/products/:product_id for DELETE by user
exports.deleteProduct = function(req, res) {
  log.debug("Content-Type: "+req.get('Content-Type'));
//deleteProduct in cache

  // Use the Product model to find a specific product and remove it
  Product.remove({ userId: req.decoded._id, _id: req.params.product_id }, function(err) {
    if (err)
      res.send(err);
    //cache.deleteProduct(product);
    res.json({ message: 'Product removed!',productId: req.params.product_id  });
  });
};