import user from '../../../DB/models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import sendEmailService from '../Services/send-email.service.js'
import { nanoid } from 'nanoid'



// =========================1-sign up api==========================================
export const signUp=async(req,res,next)=>{

// destructing data from request body
const {username,email,password,age,phoneNumbers,addresses,role}=req.body

// check if is email already exists
const isEmailExists=await user.findOne({email})

if(isEmailExists) return next (new Error('Email already exists'),{cause:409})


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

// hashing password 
const hashedPassword = bcrypt.hashSync(password,+process.env.SALTROUND)

// create new user
const newUser=await user.create({username,email,password:hashedPassword,age,phoneNumbers,addresses,role})

if(!newUser) return next(new Error('User not created'),{cause:400})

 res.status(201).json({
    sucess:true,
    message:"user created successfully",
    data:newUser
})

}
// ==========================this api to change isEmailVerified to true====================================
export const verifyEmail=async(req,res,next)=>{
const{token}=req.query
const decodedToken=jwt.verify(token,process.env.SECRET_VERIFY_TOKEN)
const updatedUser=await user.findOneAndUpdate({email:decodedToken.email,isEmailVerified:false},{isEmailVerified:true},{new:true})
 if(!updatedUser) return next(new Error('Email not Verified'),{cause:400})

  res.status(201).json({sucess:true,message:'Email verified successfully',updatedUser})




}


// ===================login api=============================


export const signIn=async(req,res,next)=>{
    const {email,password}=req.body

    // check if there is user by this email
    const userFound= await user.findOne({email,isEmailVerified:true});

    if(!userFound) return next(new Error('invalid log in credential'),{cause:404})
     
// compare password by hashed password
const isPasswordTrue=bcrypt.compareSync(password,userFound.password)
if(!isPasswordTrue) return next(new Error('invalid password'),{cause:404})

// generate token
const token=jwt.sign({email,id:userFound._id,loggedIn:true},process.env.ACCESSTOKEN,{expiresIn:'1d'})

// update loggedIn to true
await user.findOneAndUpdate({email},{isLoggedIn:true,status:'Online'})

res.status(201).json({
    success:true,
    message:'logged in successfully',
    token
})

}


// ==================================forgetPassword 

//recieve email from user
//send link to userEmail
//send token from forgetPassword Api to ResetPassword Api 
//this link has token by userEmail and hashedCode 
export const forgetPassword=async(req,res,next)=>{

    const{email}=req.body;

    const userFound=await user.findOne({email});
    if(!userFound) return next(new Error('This Email not found'),{cause:400})

    //create code
    const createdCode=nanoid(6)
    //hash code for more security
    const hashedCode=bcrypt.hashSync(createdCode,+process.env.SALTROUND)

    //generate token
    const token=jwt.sign({email,Code:hashedCode},process.env.TokenForForgetPassword)

    //genetare link to send it to userEmail

    const resetPasswordLink=`http://localhost:3000/auth/resertPassword/${token}`

    //send email

    const isEmailSent=await sendEmailService({
        to:email,
        subject:'Reset Password',
        message:`
        <h4>click here to reset your password</h4>
        <a href="${resetPasswordLink}">Reset Password</a>`
    
    })

   if(!isEmailSent) return next(new Error('Fail to send Email to reset password'))

   const updatedUserData=await user.findOneAndUpdate({email},{
    forgetCode:hashedCode
   },{new:true})

   res.status(200).json({message:'Done',updatedUserData})

}


// =================================Reset Password======================

export const resetPassword=async(req,res,next)=>{
    const{token}=req.params

    //decode token

    const decodedToken=jwt.verify(token, process.env.TokenForForgetPassword)

    const userFound=await user.findOne({email:decodedToken?.email,forgetCode:decodedToken?.Code})

    if(!userFound) return next(new Error('You already reset Your Password'))

    const{newPassword}=req.body
    //hash newPassword
    const hashedPassword=bcrypt.hashSync(newPassword,+process.env.SALTROUND)

    userFound.password=hashedPassword
    userFound.forgetCode=null

    await userFound.save()

    res.status(200).json({message:'Password reset successfully'})
}