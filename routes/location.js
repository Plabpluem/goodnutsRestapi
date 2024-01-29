const express = require('express')
const router = express.Router()
const locationController = require('../controllers/location')

router.get('/provinces',locationController.listProvinces)
router.get('/provinces/:id/city',locationController.listCity)
router.get('/city/:id',locationController.listDistricts)

module.exports = router