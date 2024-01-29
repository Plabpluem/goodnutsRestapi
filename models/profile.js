const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  name: { type: String, default:'' },
  address: { type: String, default:'' },
  postal: { type: String, default:'' },
  telephone: { type: String, default:'' },
  province:{type: String, default:''},
  city:{type: String, default:''},
  district:{type: String, default:''}
});

module.exports = mongoose.model("Profile", profileSchema);
