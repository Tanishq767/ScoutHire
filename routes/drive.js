const express = require('express')
const { getEligibleApplis } = require('../controllers/driveController')
const router = express.Router()

router.get('/drive/:id/eligible', getEligibleApplis)

module.exports = router