const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");
const auth = require("../middleware/is-auth");

router.post("/create",auth,productController.createProduct);

router.get("/product", productController.getProduct);

router.put('/profile/:profileId',auth,productController.updateProfile)

router.get("/cart", productController.getCart);

router.post("/postCart", auth, productController.postCart);

router.post("/checkout", auth, productController.getCheckout);

router.get("/checkout/success", productController.getCheckoutSuccess);

router.get("/checkout/cancel", auth, productController.getCheckout);

router.get("/order", auth, productController.getOrder);

router.get('/orders',productController.getOrders)
module.exports = router;
