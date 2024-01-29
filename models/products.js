const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    itemData: [
      {
        flavor: {
          type: String,
          required: true,
        },
        price: {
          type: Array,
          required: true,
        },
        size: {
          type: Array,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

// const mongoose = require('mongoose')
// const Schema = mongoose.Schema

// const postSchema = new Schema({
//     title:{
//         type:String,
//         required:true
//     },
//     imageUrl:{
//         type: String,
//         required:true
//     },
//     content:{
//         type: String,
//         required:true
//     },
// },{timestamps:true})

// module.exports = mongoose.model('Product',postSchema)
