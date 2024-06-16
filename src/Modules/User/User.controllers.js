import user from "../../../DB/models/user.model.js";
import bcrypt from "bcrypt";




// ===================1-update user data ==================

export const updateUserProfile = async (req, res, next) => {
  const { username, email, age, phoneNumbers, addresses, role } = req.body;
  const { _id } = req.authUser;

  // if user want to update email check first if New email not already exists

  if (email) {
    const isEmailExists = await user.findOne({ email });
    if (isEmailExists) return next(new Error("Email already Exists"));


    // send email verification

// generate token to send in url
const verifyToken=jwt.sign({email},process.env.SECRET_VERIFY_TOKEN,{expiresIn:'60s'})

const isEmailSent=await sendEmailService({
    to:email,
    subject:'Email verification',
    message:`
    <h2>Please Verify Your Email</h2>
    <a href="http://localhost:3000/auth/verify-email?token=${verifyToken}">Verify Email</a>`
})
if(!isEmailSent) return next(new Error('Email Verification failed'),{cause:400})


  }

  const updatedUser = await user.findByIdAndUpdate(
    { _id },
    { username, email, age, phoneNumbers, addresses, role },
    { new: true }
  );
  if (!updatedUser) return next(new Error("updated Failed"));

   res.status(201).json({
    success: true,
    message: "Account updated successfully",
    data: updatedUser,
  });
};

// ========================2-delete account=========================

export const deleteAcount = async (req, res, next) => {
  const { _id } = req.authUser;

  const deletedUser = await user.findByIdAndDelete({ _id });
  if (!deletedUser) return next(new Error("Deleted failed"));
  res.status(201).json({
    success: true,
    message: "Account deleted successfully",
  });
};
// ===========================3-change password===========================

export const changePassword = async (req, res, next) => {
  const { _id, password } = req.authUser; //req.authUser save all userdata related to this id
  const { oldPassword, newPassword } = req.body;

  const isOldPasswordTrue = bcrypt.compareSync(oldPassword, password);
  if (!isOldPasswordTrue) return next(new Error("incorrect password"),{cause:401});

  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.SALTROUND);

  // check if user change his profile
  const updatedPassword = await user.findByIdAndUpdate(
    { _id },
    { password: hashedPassword },
    { new: true }
  );
  if (!updatedPassword) return next(new Error("password updating failed"));

  res.status(201).json({
    success: true,
    message: "password updated successfully",
    data: updatedPassword,
  });
};
//====================== 4-Get user account data ===================

export const getUserData = async (req, res, _) => {

  res.status(201).json({
    success:true,
    message:"User Account Data",
    data:req.authUser
  })
};
