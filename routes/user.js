const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { body } = require("express-validator");
const User = require("../models/user");
const auth = require("../middleware/is-auth");
const bcrypt = require("bcrypt");

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then((user) => {
          if (!user) {
            return Promise.reject("Not found this email");
          }
        });
      }),
    body("password")
      .isLength({ min: 7 })
      .isAlphanumeric()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email })
          .then((user) => {
            return bcrypt.compare(value,user.password);
            // console.log(value)
          })
          .then((password) => {
            if (!password) {
              throw new Error("Password not match");
            }
            return true;
          });
      }),
  ],
  userController.login
);

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("This email already exist");
          }
        });
      })
      .normalizeEmail(),
    body("password").isLength({ min: 7 }).isAlphanumeric().trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password not match");
        }
        return true;
      })
      .trim(),
  ],
  userController.signin
);

router.get("/user", auth, userController.getUser);

router.post(
  "/reset",
  [
    body("oldPassword").isLength({ min: 8 }).isAlphanumeric().trim(),
    body("newPassword").isLength({ min: 8 }).isAlphanumeric().trim(),
  ],
  auth,
  userController.resetPassword
);

router.post('/resetmain',userController.postReset)

router.post('/newPassword',userController.postNewPassword)

module.exports = router;
