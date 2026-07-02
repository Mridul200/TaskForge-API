const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, getStats } = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { idValidation, handleValidation } = require('../utils/validators');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', idValidation, handleValidation, updateUser);
router.delete('/users/:id', idValidation, handleValidation, deleteUser);
router.get('/stats', getStats);

module.exports = router;


