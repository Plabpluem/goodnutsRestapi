const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const amphuresSchema = new Schema({
  id: { type: String },
  code: { type: String },
  name_th: { type: String },
  name_en: { type: String },
  province_id: { type: Number },
});

module.exports = mongoose.model('Amphures',amphuresSchema)