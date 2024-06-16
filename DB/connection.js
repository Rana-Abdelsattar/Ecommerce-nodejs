import mongoose from "mongoose";


const DB_connection=async()=>{
    
await mongoose.connect(process.env.DB_CONNECTION_ULR)
.then(() => console.log('DB Connected successfully'))
.catch(()=>{console.log("failed to connect to Db")})
}
export default DB_connection