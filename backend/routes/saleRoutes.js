const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.post('/checkout', saleController.checkout);
router.get('/bills', saleController.getBills);
router.get('/stats', saleController.getSalesStats);

module.exports = router;
