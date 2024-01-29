const Provinces = require("../models/country/provinces");
const City = require('../models/country/amphures')
const Districts = require('../models/country/districts')

exports.listProvinces = async (req, res, next) => {
  try {
    const provinces = await Provinces.find();
    res.status(200).json({ data: provinces });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.listCity = async(req,res,next) => {
    try {
        const id = req.params.id
        const city = await City.find({province_id:id});
        res.status(200).json({ data: city });
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }

    }
exports.listDistricts = async(req,res,next) => {
    try {
        const id = req.params.id
        const districts = await Districts.find({amphure_id:id});
        res.status(200).json({ data: districts });
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
}
