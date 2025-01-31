
const router = require("express").Router();
const userController = require('../controller/userControllers');
const { authGuard, validatePasswordStrength, checkAccountLockout, checkPasswordExpiry } = require("../middleware/auth");

// Creating user registration route
router.post('/create', validatePasswordStrength, userController.createUser)


//login routes
router.post('/login', checkAccountLockout,
    checkPasswordExpiry, userController.loginUser)

// forgot password
router.post('/forgot_password', userController.forgotPassword)


router.put("/resetPassword/:token", userController.resetPassword);
router.put("/verifyEmail/:token", userController.verifyEmail);

// verify otp and set password
router.post('/verify_otp', userController.verifyOtpAndSetPassword)

//get user profile
router.get('/profile/:id', authGuard, userController.getUserData);
router.get('/user/:id', userController.getUserByID);
router.get('/all_user', userController.getAllUsers);
router.get('/single_user', userController.getSingleUser);

//update user profile
router.put('/update/:id', authGuard, userController.updateUser);
// token generation
router.post("/generate_token", userController.getToken);

// get user data through token 
router.get('/getMe', authGuard, userController.getMe);
//Exporting the routes

//delete account
router.delete('/delete_account/:id', userController.deleteUser)
module.exports = router;