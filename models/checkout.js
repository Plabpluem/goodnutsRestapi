const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkoutSchema = new Schema(
  {
    products: [
      {
        product: { type: Object, required: true },
        quantity: { type: String, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    user: {
      email: { type: String, required: true },
      profile: { type: Schema.Types.ObjectId, ref: "Profile", default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkout", checkoutSchema);
