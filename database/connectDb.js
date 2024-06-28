import mongoose from 'mongoose'
import { env } from '../config/enviroment.config.js'

const connectDb = async () => {
  try {
    await mongoose.connect(env.MONGO_DB_URI)
    console.log('Connected to mongodb')
  } catch (error) {
    console.log('Error connecting to Db', error.message)
  }
}
export default connectDb
