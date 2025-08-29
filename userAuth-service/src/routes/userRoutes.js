const express = require('express');
const router = express.Router();

const {  updateUserSchema  } = require('../validations/userValidation.js');
const validate = require('../middleware/validate.js');
const upload = require("../middleware/fileUpload.js");
const { getAllUsers ,getUserById,updateUser} = require('../controllers/usercontroller.js');
const authorizeRole = require("../middleware/roleAuth.js");
const authenticateToken = require("../middleware/authMiddleware.js");


router.get('/all',authenticateToken,authorizeRole(["admin"]),getAllUsers);
router.get('/getall',getAllUsers);

router.get('/get/:id',authenticateToken,authorizeRole(["user", "admin"]),getUserById);

router.put('/delete/:id',authenticateToken,authorizeRole(["user", "admin"]),updateUser);

router.put('/update/:id',authenticateToken ,authorizeRole(["user", "admin"]),upload.single('profileImage'),validate(updateUserSchema) ,updateUser);

router.put('/update-by-admin/:id',upload.single('profileImage'),authenticateToken,authorizeRole(["admin"]) ,updateUser);

module.exports = router;