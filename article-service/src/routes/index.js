const express = require('express');
const router = express.Router();

const articleRoutes = require('./articleRoutes');

router.use('/articles', articleRoutes);


module.exports = router;