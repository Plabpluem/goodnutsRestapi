const products = require("../models/products");
const Product = require("../models/products");
const User = require("../models/user");
const Order = require("../models/checkout");
const Profile = require("../models/profile");
const { validationResult } = require("express-validator");
const path = require("path");
const stripe = require("stripe")(
  "sk_test_51O6u4SIuFzHMzXVRrJMAsR7KSSpZUi3bUZkzW0gR7s9DP6knqPBYk9euB4f989mIyOxwLhenXiCZIW1VIIRi32LE00ek1Onz6F"
);

exports.getProduct = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: "Fetch", products: products });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    const error = new Error("Not found image");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const images = req.files.map((file) => file.path.replace("\\", "/"));
  const description = req.body.description;
  const type = req.body.type;
  const itemData = JSON.parse(req.body.itemData);
  try {
    const product = new Product({
      title: title,
      image: images,
      description: description,
      type: type,
      itemData: itemData,
    });
    await product.save();
    res.status(201).json({ message: "Create product", result: product });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  const user = await User.findById(req.userId).populate("profile");
  console.log(req.body.province);
  if (!user) {
    const error = new Error("Not found User");
    error.statusCode = 422;
    throw error;
  }
  const profileId = req.params.profileId;
  try {
    if (!user.profile) {
      const profile = new Profile({
        name: req.body.name,
        address: req.body.address,
        postal: req.body.postal,
        telephone: req.body.telephone,
        province: req.body.province,
        city: req.body.city,
        district: req.body.district,
      });
      await profile.save();
      user.profile = profile;
      await user.save();
    } else {
      const profile = await Profile.findById(profileId);
      if (!profile) {
        const error = new Error("Not found profile");
        error.statusCode = 422;
        throw error;
      }
      profile.name = req.body.name;
      profile.address = req.body.address;
      profile.postal = req.body.postal;
      profile.telephone = req.body.telephone;
      profile.province = req.body.province;
      profile.city = req.body.city;
      profile.district = req.body.district;
      await profile.save();
    }
    res.status(201).json({ message: "Create profile", data: user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const products = req.body.products;
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("dont find user");
      error.statusCode = 403;
      throw error;
    }
    user.cart.items = products.map((product) => ({
      productId: product.id,
      quantity: product.amount,
      price: product.price,
    }));
    await user.save();
    res.status(201).json({ message: "Post Cart" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(201).json({ message: "get Cart", result: user.cart.items });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    let products;
    const user = await User.findById(req.userId).populate(
      "cart.items.productId"
    );
    if (!user) {
      const error = new Error("not found user");
      error.statusCode = 442;
      throw error;
    }
    products = user.cart.items;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: products.map((item) => {
        return {
          quantity: item.quantity,
          price_data: {
            unit_amount: item.price * 100,
            currency: "thb",
            product_data: {
              name: item.productId.title,
            },
          },
        };
      }),
      success_url:
        req.protocol +
        "://" +
        req.get("host") +
        "/product/checkout/success?userId=" +
        req.userId,
      cancel_url:
        req.protocol + "://" + req.get("host") + "/product/checkout/cancel",
    });
    res.status(201).json({ message: "post payment", sessionId: session.url });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId).populate("cart.items.productId");
    const profile = await Profile.findById(user.profile)
    if (!user) {
      const error = new Error("not found user");
      error.statusCode = 422;
      throw error;
    }
    const products = user.cart.items.map((item) => {
      return { product: { ...item.productId._doc }, quantity: item.quantity,totalPrice: item.price };
    });
    const checkout = new Order({
      products: products,
      user: {
        email: user.email,
        profile: user.profile
      },
    });
    const order = await checkout.save();
    // res.status(201).json({message:'Create order',order:order})
    res.redirect("http://localhost:3000");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  const currentPage = +req.query.page || 1
  const perPage = 6
  try {
    const user = await User.findById(req.userId).populate("profile");
    const totalItem = await Order.find({ "user.email": user.email }).countDocuments();
    const order = await Order.find({ "user.email": user.email }).skip((currentPage - 1)* perPage).limit(perPage)
    res.status(200).json({
      message: "Fetch order",
      user: order,
      productId: user.profile._id,
      totalItem: totalItem
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrders = async (req,res,next) => {
  try {
    const orders = await Order.find().populate('user.profile').sort({createdAt:-1})
    res.status(200).json({message:'Fetch Orders',order:orders})
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
