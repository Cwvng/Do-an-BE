import mongoose from "mongoose";

const connectDb= async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log('Connected to mongodb')
    }catch (error){
        console.log("Error connecting to Db", error.message)
    }
}
export default connectDb