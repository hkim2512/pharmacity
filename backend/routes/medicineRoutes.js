const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getMedicines);
router.post('/', medicineController.createMedicine);
router.post('/:medicineId/batches', medicineController.addBatch);
router.put('/batches/:batchId', medicineController.updateBatch);

module.exports = router;
