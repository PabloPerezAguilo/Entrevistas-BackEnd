var productController = require('../../app/controllers/product');
var userController = require('../../app/controllers/user');
var authRole = require('../../app/controllers/authRole');

var log4js = require('log4js');
var log = log4js.getLogger("routes");

// API PRIVATE routes
 module.exports = function(router) {

// Create endpoint handlers for /products
router.route('/products')
  .post(productController.postProducts)
  .get(productController.getProducts);


router.route('/productsbyuser')
  .get(productController.getProductsByUser);

// Create endpoint handlers for /products/:product_id
router.route('/products/:product_id')
  .get(productController.getProduct)
  .put(productController.putProduct)
  .delete(productController.deleteProduct);

// Create endpoint handlers for /products/:product_id
router.route('/productsbyuser/:product_id')
  .get(productController.getProductByUser);

// Create endpoint handlers for /users
router.route('/users')
  .get(authRole.isAdminRole,userController.getUsers);

return router;
};