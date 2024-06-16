
import jwt from 'jsonwebtoken'
import user from '../../DB/models/user.model.js'
export const authentication=(AccessRoles)=>{
    return async (req,res,next)=>{
        
      try{
        const {token}=req.headers
        
        if(!token) return next(new Error('please login first',{cause:404}))
 
        if(!token.startsWith('accessToken_')) return next(new Error('invalid access token prefix',{cause:400}))
 
        const accessToken=token.split('accessToken_')[1];
 
        const decodedToken=jwt.verify(accessToken,process.env.ACCESSTOKEN)
        if(!decodedToken || !decodedToken.id) return next(new Error('invalid token payload'),{cause:400})
 
        const findUser=await user.findById(decodedToken.id)
        if(!findUser) return next(new Error('please login first'),{cause:404})
         
        // check authorization 
        
       if(!AccessRoles.includes(findUser.role)) return next(new Error('You are not allowed to access this route'),{cause:401})
       
        req.authUser=findUser
        next()
        
      }catch(err){
        return next(new Error('Catch Error in Authentication MiddleWare'),{cause:500})
      }

    }
}