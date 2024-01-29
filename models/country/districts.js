const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const districtsSchema = new Schema({
  id: { type: String },
  code: { type: String },
  name_th: { type: String },
  name_en: { type: String },
  amphure_id: { type: Number },
});

module.exports = mongoose.model('Districts',districtsSchema)