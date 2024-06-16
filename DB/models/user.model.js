import mongoose, { Schema,model } from "mongoose";

import systemRoles from '../../src/Utils/system-roles.js'
const userSchema=new Schema({

    username:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        minlength:3,
        maxlength:20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
       
    },
    phoneNumbers:[{
        type:String,
        required:true
    }],
    addresses:[{
        type:String,
        required:true
    }],
    role:{
        type:String,
        enum:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.DELIEVER,systemRoles.USER],
        default:systemRoles.USER
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        default:'Offline',
        enum:['Online','Offline']
    },
    age:{
        type:Number,
        min:18,
        max:100
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    },
    forgetCode:String



},{timestamps:true})


const user = model('user',userSchema);

export default mongoose.model.user || user
