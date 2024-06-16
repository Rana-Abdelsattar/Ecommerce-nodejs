import joi from 'joi'
import systemRoles from '../../Utils/system-roles.js'



//=====signUp validate schema

export const signUpSchema={
    body:joi.object({
        username:joi.string().max(20).min(3).lowercase().required(),
        email:joi.string().email().required(),
        password:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
        .message(`password Requires at least one lowercase letter
         and at least one uppercase letter and at least one digit 
         and minimum length of 8 characters.`).required(),
         addresses:joi.array().items(joi.string().min(3).max(25)).required(),
         phoneNumbers:joi.array().items(joi.string().pattern(/^01[0125][0-9]{8}$/)).required(),
         age:joi.number().min(18).max(100),
         role:joi.string().valid(systemRoles.ADMIN,systemRoles.USER)
    }
    )}

//==========================================================================================================

    // ============ signIn schema

    export const signInSchema={
        body:joi.object({
            email:joi.string().email().required(),
            password:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
            .message(`password Requires at least one lowercase letter
             and at least one uppercase letter and at least one digit 
             and minimum length of 8 characters.`).required()
        })
    }

//===============================================================================================================

//===============forgetPassword schema

export const forgetPasswordSchema={
    body:joi.object({
        email:joi.string().email().required()
    })
}