import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  authGoogleID: {
    type: String,
    default: null
  },
  password: {
    type: String
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
    default: 'male'
  },
  profilePic: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  try {
    if (this.authType !== 'local') next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    next(error)
  }
})
userSchema.methods.isCorrectPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password)
  } catch (error) {
    throw new Error(error)
  }
}
const User = mongoose.model('User', userSchema)
export default User
