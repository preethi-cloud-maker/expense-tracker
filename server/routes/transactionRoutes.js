const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
