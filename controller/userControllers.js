const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtp = require("../service/sendOtp");
const User = require("../model/userModel");
const crypto = require("crypto");
const sendEmail = require("../middleware/sendEmail");
const { z, ZodError } = require("zod");

// const validatePassword = (password) => {
//   const minLength = 8;
//   const complexityPattern =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

//   if (password.length < minLength) {
//     return {
//       valid: false,
//       message: "Password must be more than 8 characters long.",
//     };
//   }

//   if (!complexityPattern.test(password)) {
//     return {
//       valid: false,
//       message:
//         "Password must include uppercase, lowercase, number, and special character.",
//     };
//   }
//   return { valid: true };
// };
// Utility function to assess password strength (for real-time feedback)
const assessPasswordStrength = (password) => {
  const strength = {
    0: "Weak",
    1: "Fair",
    2: "Good",
    3: "Strong",
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
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user with the matching token and ensure it hasn't expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpire: { $gt: Date.now() }, // Ensure the token hasn't expired
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

// Utility function to check password history
const checkPasswordHistory = async (userId, newPassword) => {
  const user = await User.findById(userId);
  for (const oldPassword of user.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, oldPassword);
    if (isMatch) {
      return false;
    }
  }
  return true;
};

// Zod validation schemas
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(1, "Password is required."),
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// Utility function to validate schema
const validateSchema = (schema, data) => {
  try {
    return { valid: true, data: schema.parse(data) };
  } catch (err) {
    if (err instanceof ZodError) {
      return { valid: false, errors: err.errors.map((e) => e.message) };
    }
    return { valid: false, errors: ["Unknown validation error."] };
  }
};

// Utility function to validate password strength
const validatePassword = (password) => {
  const minLength = 8;
  const complexityPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (password.length < minLength) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  if (!complexityPattern.test(password)) {
    return {
      valid: false,
      message:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    };
  }
  return { valid: true };
};

// API: Create a new user
const createUser = async (req, res) => {
  const validation = validateSchema(registerSchema, req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  const { firstName, lastName, email, password } = validation.data;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message,
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpire: Date.now() + 10 * 60 * 1000,
    });

    await newUser.save();

    const verificationUrl = `${req.protocol}://localhost:3000/verify-email/${verificationToken}`;
    const message = `Please verify your email by clicking on this link: \n\n ${verificationUrl}`;

    await sendEmail({
      email: newUser.email,
      subject: "Email Verification",
      message,
    });

    res.status(201).json({
      success: true,
      message:
        "User created successfully! Please verify your email to complete registration.",
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// API: Login user
const loginUser = async (req, res) => {
  const validation = validateSchema(loginSchema, req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  const { email, password } = validation.data;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      userData: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// API: Update user
const updateUser = async (req, res) => {
  const validation = validateSchema(updateSchema, req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updates = validation.data;

    Object.assign(user, updates);

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
// const createUser = async (req, res) => {
//   //Step two : Destrucutre the incoming data (i.e., firstname,lastname,age)
//   const { firstname, lastname, email, password } = req.body;

//   // try {
//   //   const validated = registerSchema.parse(req.body);
//   //   const userExists = await User.findOne({ email: validated.email });

//   //   if (userExists) {
//   //     return next(new AppError("User already exists", 400));
//   //   }
//   //   const user = await User.create({
//   //     firstName: validated.firstName,
//   //     lastName: validated.lastName,
//   //     email: validated.email,
//   //     password: validated.password,
//   //   });

//   //   res.status(201).json({
//   //     status: "success",
//   //     data: {
//   //       user: {
//   //         _id: user._id,
//   //         firstName: user.firstname,
//   //         lastName: user.lastname,
//   //         email: user.email,
//   //         role: user.role,
//   //       },
//   //     },
//   //   });
//   // } catch (error) {
//   //   if (error instanceof ZodError) {
//   //     return next(new AppError(error.errors[0].message, 400));
//   //   }
//   //   next(error);
//   // }

//   //Step three : Validate the data (Check if empty, stop the process and send response)
//   if (!firstname || !lastname || !email || !password) {
//     return res.json({
//       success: false,
//       message: "Please fill up all the given fields!",
//     });
//   }

//   // Validate password
//   const passwordValidation = validatePassword(password);
//   if (!passwordValidation.valid) {
//     return res.json({
//       success: false,
//       message: passwordValidation.message,
//     });
//   }

//   //Step four :  Error Handling (Try , Catch)
//   try {
//     //Step five : Check if the user is already registered or not
//     const existingUser = await User.findOne({ email: email });

//     //Step 5.1(If User found) : Send response

//     if (existingUser) {
//       return res.json({
//         success: false,
//         message: "User already exists!",
//       });
//     }
//     // hashing/encryption of the password
//     const randomSalt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, randomSalt);

//     //Step 5.1.1 : Stop the process
//     //Step 5.2(If user is not registered/ is new) :
//     // Generate and hash email verification token
//     const verificationToken = crypto.randomBytes(20).toString("hex");
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");

//     // Create new user
//     const newUser = new User({
//       firstname,
//       lastname,
//       email,
//       password: hashedPassword,
//       passwordHistory: [hashedPassword],
//       passwordChangedAt: new Date(),
//       loginAttempts: 0,
//       lockUntil: null,
//       isEmailVerified: false,
//       emailVerificationToken: hashedToken,
//       emailVerificationTokenExpire: Date.now() + 10 * 60 * 1000, // Token expires in 10 minutes
//     });

//     //Step 5.2.2 : Save to Database.
//     await newUser.save();

//     // Create verification URL
//     const verificationUrl = `${req.protocol}://localhost:3000/verify-email/${verificationToken}`;
//     const message = `Please verify your email by clicking on the following link: \n\n ${verificationUrl}`;

//     // Send verification email
//     await sendEmail({
//       email: newUser.email,
//       subject: "Email Verification",
//       message,
//     });
//     res.json({
//       success: true,
//       message:
//         " User created successfully! Please verify your email to complete registration.",
//     });
//   } catch (error) {
//     // console.log(error);
//     res.json({
//       success: false,
//       message: "Internal Server Error!",
//     });
//   }
// };
// login API Creation
// const loginUser = async (req, res) => {
//   // destructuring
//   const { email, password } = req.body;

//   //validation
//   if (!email || !password) {
//     return res.json({
//       success: false,
//       message: "Please enter all fields!",
//     });
//   }

//   //try catch
//   try {
//     // find user by email
//     const user = await User.findOne({ email: email });
//     // found data : first name, lastname, email, password

//     // not fount the email( error message saying user doesnt exist)
//     if (!user) {
//       return res.json({
//         success: false,
//         message: "User does not exist.",
//       });
//     }

//     if (!user.isEmailVerified) {
//       return res.json({
//         success: false,
//         message: "Please verify your email before logging in.",
//       });
//     }

//     if (user.isLocked) {
//       return res.json({
//         success: false,
//         message: `Account is locked. Please try again later. It will be unlocked at ${user.lockUntil}.`,
//         lockUntil: user.lockUntil,
//       });
//     }

//     // compare the password.( using bycript)
//     const isValidPassword = await bcrypt.compare(password, user.password);

//     // not compare error saying password is incorrect.
//     if (!isValidPassword) {
//       user.loginAttempts += 1;
//       let lockMessage = "";
//       if (user.loginAttempts >= 5) {
//         user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // lock for 30 minutes
//         lockMessage = ` Your account is now locked until ${user.lockUntil}.`;
//       }
//       await user.save();
//       return res.json({
//         success: false,
//         message: `Invalid credentials. You have ${
//           5 - user.loginAttempts
//         } attempts left.${lockMessage}`,
//         remainingAttempts: 5 - user.loginAttempts,
//         lockUntil: user.lockUntil,
//       });
//     }
//     user.loginAttempts = 0;
//     user.lockUntil = null;
//     await user.save();

//     //token ( generate - userdata + KEY)
//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // sending the response ( token, user data,)
//     res.json({
//       success: true,
//       message: "user logined successfull",
//       token: token,
//       userData: user,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }

// try {
//   const validated = loginSchema.parse(req.body);
//   const user = await User.findOne({
//     email: validated.email.toLowerCase(),
//   }).select("+password");

//   if (!user || !(await user.matchPassword(validated.password))) {
//     return next(new AppError("Invalid email or password", 401));
//   }

//   const token = user.getSignedJwtToken();

//   // Cookie options
//   const cookieOptions = {
//     expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict", // Protect against CSRF Attacks
//   };

//   // Clear any existing cookies
//   res.clearCookie("jwt");

//   // Set new token cookie
//   res.cookie("jwt", token, cookieOptions);

//   // Remove password from output
//   user.password = undefined;

//   res.status(200).json({
//     status: "success",

//     data: {
//       user: {
//         _id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//       },
//     },
//   });
// } catch (error) {
//   if (error instanceof ZodError) {
//     return next(new AppError(error.errors[0].message, 400));
//   }
//   next(error);
// }
// };

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
//     const user = await User.findOne({ email: email });
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
  const id = req.params.id;
  if (!id) {
    return res.json({
      success: false,
      message: "User ID is required!",
    });
  }
  try {
    const user = await User.findById(id);
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json("Server Error");
  }
};

//fetch user data
const getUserData = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request parameters
    // console.log("User ID:", userId); // Log the user ID

    const user = await User.findById(userId);
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
      },
    });
    // console.log(user);
  } catch (error) {
    // console.log("getUserData error:", error); // Log error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }

  // try {
  //   const user = await User.findById(req.user.id);
  //   res.status(200).json({
  //     status: "success",
  //     data: { user },
  //   });
  // } catch (error) {
  //   next(error);
  // }
};

// const updateUser = async (req, res) => {
//   try {
//     const { firstname, lastname, email } = req.body || {};

//     // Checking if the user exists
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Update user fields
//     user.firstname = firstname || user.firstname;
//     user.lastname = lastname || user.lastname;
//     user.email = email || user.email;

//     // Save updated user data
//     const updatedUser = await user.save();

//     // Sending the response
//     return res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error!",
//       error: error.message,
//     });
//   }

// try {
//   const validated = updateSchema.parse(req.body);

//   // Update user
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     { $set: validated },
//     { new: true, runValidators: true }
//   );

//   // Remove password from response
//   updatedUser.password = undefined;

//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser,
//     },
//   });
// } catch (error) {
//   if (error instanceof ZodError) {
//     return next(new AppError(error.errors[0].message, 400));
//   }
//   next(error);
// }
// };

// get all users
const getAllUsers = async (req, res) => {
  try {
    const allusers = await User.find();
    res.status(200).json({ success: true, data: allusers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// const forgotPassword = async (req, res) => {
//   const { phone } = req.body;

//   if (!phone) {
//     return res.status(400).json({
//       success: false,
//       message: "Provide your phone number!",
//     });
//   }

//   try {
//     const user = await User.findOne({ phone: phone });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User Not Found!",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000);

//     const expiryDate = Date.now() + 360000;

//     user.resetPasswordOTP = otp;
//     user.resetPasswordExpires = expiryDate;
//     await user.save();

//     const isSent = await sendOtp(phone, otp);
//     if (!isSent) {
//       return res.status(400).json({
//         success: false,
//         message: "Error Sending OTP Code!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "OTP Send Successfully!",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error!",
//     });
//   }
// };

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set the reset token in the database
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://localhost:3000/resetPassword/${resetToken}`;

    // Send the email
    const message = `You are receiving this email because you has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.json({
      success: true,
      message: "Email sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({ success: false, message: "Server error." });
  }
};

// get single user
const getSingleUser = async (req, res) => {
  // console.log(req.users);
  // console.log(req);
  const id = req.user.userId;
  try {
    const user = await User.findById(id);
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

const resetPassword = async (req, res) => {
  const resetToken = req.params.token;

  // Hash the token and compare it to the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid token or token has expired.",
      });
    }

    // Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfull.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.json({ success: false, message: "Server error." });
  }
};

// const verifyOtpAndSetPassword = async (req, res) => {
//   const { phone, otp, newPassword } = req.body;
//   if (!phone || !otp || !newPassword) {
//     return res.status(400).json({
//       success: false,
//       message: "Required fields are missing!",
//     });
//   }

//   try {
//     const user = await User.findOne({ phone: phone });

//     if (user.resetPasswordOTP != otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP!",
//       });
//     }

//     if (user.resetPasswordExpires < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP Expired!",
//       });
//     }

//     const randomSalt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

//     user.password = hashedPassword;
//     // user.password =newPassword;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "OTP Verified and Password Updated!",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error!",
//     });
//   }
// };
const getToken = async (req, res) => {
  try {
    // console.log(req.body);
    const { id } = req.body;

    const user = await User.findById(id);
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
    // console.log(error);
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
    const user = await User.findById(req.params.id);

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
    const user = await User.findByIdAndDelete(req.params.id);
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
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
    });
  }
  // try {
  //   await User.findByIdAndDelete(req.user.id);
  //   res.status(204).json({
  //     status: "success",
  //     data: null,
  //   });
  // } catch (error) {
  //   next(error);
  // }
};

exports.logout = async (req, res, next) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
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
  // verifyOtpAndSetPassword,
  getSingleUser,
  validatePassword,
  resetPassword,
  verifyEmail,
  checkPasswordHistory,
  assessPasswordStrength,
};
