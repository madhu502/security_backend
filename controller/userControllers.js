const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtp = require("../service/sendOtp");
const User = require("../model/userModel");
const crypto = require("crypto");

const validatePassword = (password) => {
  const minLength = 8;
  const complexityPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

  if (password.length < minLength) {
    return {
      valid: false,
      message: "Password must be more than 8 characters long.",
    };
  }

  if (!complexityPattern.test(password)) {
    return {
      valid: false,
      message:
        "Password must include uppercase, lowercase, number, and special character.",
    };
  }

  return { valid: true };
};

// Utility function to check password history
const checkPasswordHistory = async (userId, newPassword) => {
  const user = await Users.findById(userId);
  for (const oldPassword of user.passwordHistory) {
      const isMatch = await bcrypt.compare(newPassword, oldPassword);
      if (isMatch) {
          return false;
      }
  }
  return true;
};

// Utility function to assess password strength (for real-time feedback)
const assessPasswordStrength = (password) => {
  const strength = {
      0: "Weak",
      1: "Fair",
      2: "Good",
      3: "Strong"
  };
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  return strength[score > 3 ? 3 : score];
};

const verifyEmail = async (req, res) => {
  try {
      const token = req.params.token;

      // Hash the received token to compare with the stored one
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find the user with the matching token and ensure it hasn't expired
      const user = await User.findOne({
          emailVerificationToken: hashedToken,
          emailVerificationTokenExpire: { $gt: Date.now() } // Ensure the token hasn't expired
      });

      if (!user) {
          return res.json({ success: false, message: "Invalid or expired token" });
      }

      // Mark the user's email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined; // Clear the token fields
      user.emailVerificationTokenExpire = undefined;

      await user.save();

      res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
      console.error("Verification Error:", error);
      res.json({ success: false, message: "Server error" });
  }
};

const createUser = async (req, res) => {
  //Step one : Check incoming data
  console.log(req.body);
  //Step two : Destrucutre the incoming data (i.e., firstname,lastname,age)
  const { firstname, lastname, phone, email, password } = req.body;

  //Step three : Validate the data (Check if empty, stop the process and send response)
  if (!firstname || !lastname || !email || !phone || !password) {
    // res.send("Please fill up all the given fields!");
    //res.status(400).json()
    return res.json({
      //in json format
      success: false,
      message: "Please fill up all the given fields!",
    });
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.json({
      success: false,
      message: passwordValidation.message,
    });
  }

  //Step four :  Error Handling (Try , Catch)
  try {
    //Step five : Check if the user is already registered or not
    const existingUser = await userModel.findOne({ email: email });

    //Step 5.1(If User found) : Send response

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists!",
      });
    }
    // hashing/encryption of the password
    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    //Step 5.1.1 : Stop the process
    //Step 5.2(If user is not registered/ is new) :
    // Generate and hash email verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      passwordChangedAt: new Date(),
      loginAttempts: 0,
      lockUntil: null,
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpire: Date.now() + 10 * 60 * 1000, // Token expires in 10 minutes
    });

    //Step 5.2.2 : Save to Database.
    await newUser.save();
    res.json({
      success: true,
      message: " User created successfully!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};
// login API Creation
const loginUser = async (req, res) => {
  //check incoming data
  console.log(req.body);
  // destructuring
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  //try catch
  try {
    // find user by email
    const user = await userModel.findOne({ email: email });
    // found data : first name, lastname, email, password

    // not fount the email( error message saying user doesnt exist)
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist.",
      });
    }

    // compare the password.( using bycript)
    const isValidPassword = await bcrypt.compare(password, user.password);

    // not compare error saying password is incorrect.
    if (!isValidPassword) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }
    //token ( generate - userdata + KEY)
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // sending the response ( token, user data,)
    res.json({
      success: true,
      message: "user logined successfull",
      token: token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// const loginUser = async (req, res) => {
//   console.log(req.body);

//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.json({
//       success: false,
//       message: "please enter all fields!",
//     });
//   }

//   try {
//     const user = await userModel.findOne({ email: email });
//     if (!user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User doesn't exist" });
//     }

//     const passwordCorrect = await bcrypt.compare(password, user.password);
//     if (!passwordCorrect) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Password is incorrect" });
//     }

//     const token = await jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },
//       process.env.JWT_SECRET
//     );

//     res.status(201).json({
//       sucess: true,
//       message: "Logged in Successfully!",
//       token: token,
//       user: user,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server error",
//       error: err,
//     });
//   }
// };

const getMe = async (req, res) => {
  const user = await userModel.findById(req.user.id).select("-password");
  return res.status(200).json({ user });
};

//fetch user data
const getUserData = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request parameters
    console.log("User ID:", userId); // Log the user ID

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "user data!",
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
      },
    });
    console.log(user);
  } catch (error) {
    console.log("getUserData error:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { firstname, lastname, email, phone } = req.body || {};

    // Checking if the user exists
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // Save updated user data
    const updatedUser = await user.save();

    // Sending the response
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    const allusers = await userModel.find();
    res.status(200).json({ success: true, data: allusers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Provide your phone number!",
    });
  }

  try {
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found!",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const expiryDate = Date.now() + 360000;

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = expiryDate;
    await user.save();

    const isSent = await sendOtp(phone, otp);
    if (!isSent) {
      return res.status(400).json({
        success: false,
        message: "Error Sending OTP Code!",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP Send Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};

// get single user
const getSingleUser = async (req, res) => {
  console.log(req.users);
  // console.log(req);
  const id = req.user.userId;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User found",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

const verifyOtpAndSetPassword = async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (!phone || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing!",
    });
  }

  try {
    const user = await userModel.findOne({ phone: phone });

    if (user.resetPasswordOTP != otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired!",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

    user.password = hashedPassword;
    // user.password =newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP Verified and Password Updated!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};
const getToken = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      message: "Token generated successfully!",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Get user by ID
const getUserByID = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
//delete user
const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    await user.remove();
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUserData,
  getUserByID,
  getAllUsers,
  deleteUser,
  getMe,
  getToken,
  updateUser,
  forgotPassword,
  verifyOtpAndSetPassword,
  getSingleUser,
  validatePassword,
};
