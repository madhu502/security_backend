const router = require("express").Router();
const userController = require("../controller/userControllers");
const {
  authGuard,
  validatePasswordStrength,
  checkPasswordExpiry,
  checkAccountLockout,
} = require("../middleware/auth");

// Creating user registration route
router.post("/register", validatePasswordStrength, userController.createUser);

//login routes
router.post(
  "/login",
  checkAccountLockout,
  checkPasswordExpiry,
  userController.loginUser
);

// forgot password
router.post("/forgotPassword", userController.forgotPassword);
// Reset password route
router.put("/resetPassword/:token", userController.resetPassword);
router.put("/verifyEmail/:token", userController.verifyEmail);

//get user profile
router.get("/profile/:id", authGuard, userController.getUserData);
router.get("/user/:id", userController.getUserByID);
router.get("/all_user", userController.getAllUsers);
router.get("/single_user", authGuard, userController.getSingleUser);

//update user profile
router.put("/update/:id", authGuard, userController.updateUser);
// token generation
router.post("/generate_token", userController.getToken);

// get user data through token
router.get("/getMe", authGuard, userController.getMe);
//Exporting the routes

//delete account
router.delete("/delete_account/:id", authGuard, userController.deleteUser);
module.exports = router;
