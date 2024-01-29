const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const provincesSchema = new Schema({
  id: { type: String },
  code: { type: String },
  name_th: { type: String },
  name_en: { type: String },
  geography_id: { type: Number },
});

module.exports = mongoose.model('Provinces',provincesSchema)