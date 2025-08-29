const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes.js');
const authRoutes = require('./authRoutes.js');

router.use('/users',userRoutes);
router.use('/auth',authRoutes); 


module.exports = router;