const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const geographiesSchema = new Schema({
  id: { type: String },
  name: { type: String },
});

module.exports = mongoose.model('Geography',geographiesSchema)