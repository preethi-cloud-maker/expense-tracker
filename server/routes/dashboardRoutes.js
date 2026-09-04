const express = require('express');
const router = express.Router();
const { getSummary, getMonthly, getCategories } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/summary', getSummary);
router.get('/monthly', getMonthly);
router.get('/categories', getCategories);

module.exports = router;
