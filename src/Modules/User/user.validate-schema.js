

import joi from 'joi'
import systemRoles from '../../Utils/system-roles.js'



// ===============update user data Schema==============
export const updateUserProfileSchema={
    body:joi.object({
        username:joi.string().max(20).min(3).lowercase(),
         email:joi.string().email(), 
         age:joi.number().min(18).max(100), 
         phoneNumbers:joi.array().items(joi.string().pattern(/^01[0125][0-9]{8}$/)),
          addresses:joi.array().items(joi.string().min(3).max(25)), 
          role :joi.string().valid(systemRoles.ADMIN,systemRoles.USER)  
    }),
    headers:joi.object({
        token:joi.string().required()
    }).options({allowUnknown:true})
}

// ===============change password Schema==========
export const changePasswordSchema={
    
    body:joi.object({
        oldPassword:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
        .message(`password Requires at least one lowercase letter
         and at least one uppercase letter and at least one digit 
         and minimum length of 8 characters.`).required(),
         newPassword:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
         .message(`password Requires at least one lowercase letter
          and at least one uppercase letter and at least one digit 
          and minimum length of 8 characters.`).required()
    }),
    headers:joi.object({
        token:joi.string().required()
    }).options({allowUnknown:true})

}

// =========================