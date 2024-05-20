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
      return res.status(StatusCodes.BAD_REQUEST).send({ error: "Password don't match" })
    }
    const user = await User.findOne({ email })
    if (user) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'User existed' })

    // generate default avatar
    const profilePic = `https://ui-avatars.com/api/?background=random&name=${firstname}+${lastname}`

    const newUser = User({
      firstname,
      lastname,
      email,
      password,
      gender,
      profilePic
    })
    console.log(newUser)
    if (newUser) {
      // JWT token
      const token = encodedToken(newUser._id)
      await newUser.save()

      res.status(StatusCodes.CREATED).send({
        user: newUser,
        access_token: token

      })
    } else {
      res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid user data' })
    }
  } catch (err) {
    console.log('Signup error')
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: err.message })
  }
}
export const login = async (req, res, next) => {
  try {
    const email = req.body.email.trim()
    const token = encodedToken(req.user._id)
    const user = await User.findOne({ email })
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).send({
        error: 'Email or password incorrect'
      })
    }
    res.setHeader('Authorization', token)
    return res.status(StatusCodes.OK).send({
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
    res.status(StatusCodes.OK).send({ message: 'Logged out' })
  } catch (err) {
    console.log('Logout error')
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: err.message })
  }
}

export const googleLogin = async (req, res, next) => {
  try {
    const email = req.user.email.trim()
    const token = encodedToken(req.user._id)
    const user = await User.findOne({ email })
    return res.status(StatusCodes.OK).send({
      user,
      access_token: token
    })
  } catch (error) {
    console.log('Secret error')
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: error.message })
  }
}
