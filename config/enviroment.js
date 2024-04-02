import 'dotenv/config'

export const env = {
  PORT: process.env.PORT,
  MONGO_DB_URI: process.env.MONGO_DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET

}
