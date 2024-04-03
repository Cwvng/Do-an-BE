import User from '../models/user.model.js'
import { encodedToken } from '../utils/generateToken.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

export const signup = async (req, res) => {
  try {
    const firstname = req.body.firstname.trim()
    const lastname = req.body.lastname.trim()
    const email = req.body.email.trim()
    const password = req.body.password.trim()
    const confirmPassword = req.body.confirmPassword.trim()
    const gender = req.body.gender.trim()
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password don't match" })
    }
    const user = await User.findOne({ email })
    if (user) return res.status(400).json({ error: 'User existed' })

    // generate default avatar
    const malePic = `https://avatar.iran.liara.run/public/boy?username=${firstname}`
    const femalePic = `https://avatar.iran.liara.run/public/girl?username=${firstname}`

    const newUser = User({
      firstname,
      lastname,
      email,
      password,
      gender,
      profilePic: gender === 'male' ? malePic : femalePic
    })
    console.log(newUser)
    if (newUser) {
      // JWT token
      const token = encodedToken(newUser._id)
      await newUser.save()

      res.status(201).json({
        user: newUser,
        access_token: token

      })
    } else {
      res.status(400).json({ error: 'Invalid user data' })
    }
  } catch (err) {
    console.log('Signup error')
    res.status(500).json({ error: err.message })
  }
}
export const login = async (req, res, next) => {
  try {
    const email = req.body.email.trim()
    const token = encodedToken(req.user._id)
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({
        error: 'Email or password incorrect'
      })
    }
    return res.status(200).json({
      user,
      access_token: token
    })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const logout = async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 })
    res.status(200).json({ message: 'Logged out' })
  } catch (err) {
    console.log('Logout error')
    res.status(500).json({ error: err.message })
  }
}

export const googleLogin = async (req, res, next) => {
  try {
    const email = req.user.email.trim()
    const token = encodedToken(req.user._id)
    const user = await User.findOne({ email })
    return res.status(200).json({
      user,
      access_token: token
    })
  } catch (error) {
    console.log('Secret error')
    res.status(500).json({ error: error.message })
  }
}
