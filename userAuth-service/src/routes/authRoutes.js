const express = require('express');
const router = express.Router();

const {createUser,setPassword,loginUser,forgotPassword,resetpassword} = require('../controllers/authcontroller.js');
const { createUserSchema, setPasswordSchema, loginSchema, forgotPasswordSchema,resetPasswordSchema  } = require('../validations/userValidation.js');
const validate = require('../middleware/validate.js');
const upload = require("../middleware/fileUpload.js");


router.post('/create', upload.single('profileImage'),validate(createUserSchema), createUser);

router.post('/set-password/:token', validate(setPasswordSchema),setPassword);

router.post('/login',validate(loginSchema),loginUser);

router.post('/forgot-password',validate(forgotPasswordSchema) ,forgotPassword);

router.post('/reset-password/:token',validate(resetPasswordSchema) ,resetpassword);


module.exports = router;