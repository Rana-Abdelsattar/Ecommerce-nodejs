

const reqKeys=['body','params','headers','query','file']
 const validationMiddleWare=(schema)=>{
    return (req,res,next)=>{

     const validationErrorArr=[];

    for (const key of reqKeys) {  
        const validationResult= schema[key]?.validate(req[key],{abortEarly:false})
             if(validationResult?.error)
             {
                validationErrorArr.push(...validationResult.error.details)
            }
}

     if(validationErrorArr.length)
     {
        return res.status(400).json({
            message:"validation Error",
            Errors:validationErrorArr.map(ele=>ele.message)
        })
     }
     next()

    }
}
export default validationMiddleWare