const User = require("../models/user");
const Profile = require("../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation Fail Signup");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const user = await User.findOne({ email: email }).populate("profile");
    if (!user) {
      const error = new Error("Not Found user");
      error.statusCode = 401;
      throw error;
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        password: user.email,
        userId: user._id.toString(),
      },
      "supertokensecretgoodnuts",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login Success",
      token: token,
      userId: user._id.toString(),
      email: user.email,
      productId: user.profile._id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation Fail Signup");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
    });
    const profile = new Profile();
    await profile.save();
    user.profile = profile;
    await user.save();
    res.status(201).json({ message: "Create User" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      const error = new Error("Validation Fail reset password");
      error.statusCode = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Not found user");
      error.statusCode = 401;
      throw error;
    }
    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      const error = new Error("Password not Match");
      error.statusCode = 401;
      throw error;
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.status(201).json({ message: "Change Password Done!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("profile");
    res.status(201).json({ message: "Create User", user: user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postReset = async (req, res, next) => {
  const email = req.body.email
  try {
    let token;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      token = buffer.toString("hex");
    });
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Not found user");
      error.statusCode = 401;
      throw error;
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
    await user.save();
    res.status(201).json({ message: "Message Reset Password",token:token,userId: user._id.toString()});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const token = req.body.token
  const userId = req.body.userId
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    if (!user) {
      const error = new Error("Not found user");
      error.statusCode = 401;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(201).json({message: "Success"})
  } catch (error) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
