import User from '../models/user.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/apiError.js'
import { sendingMail } from '../utils/mailing.js'
import { encodedToken, isTokenValid } from '../utils/token.js'
import { env } from '../config/enviroment.config.js'

export const signup = async (req, res, next) => {
  try {
    const firstname = req.body.firstname.trim()
    const lastname = req.body.lastname.trim()
    const email = req.body.email.trim()
    const password = req.body.password.trim()
    const confirmPassword = req.body.confirmPassword.trim()
    const gender = req.body.gender.trim()
    if (password !== confirmPassword) {
      next(new ApiError(StatusCodes.BAD_REQUEST, "Password don't match"))
    }
    const user = await User.findOne({ email })
    if (user) next(new ApiError(StatusCodes.BAD_REQUEST, 'Email has been used'))

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

    if (newUser) {
      // JWT token
      const token = encodedToken(newUser._id)

      if (token) {
        // send email to the user
        // with the function coming from the mailing.js file
        // message containing the user id and the token to help verify their email
        await sendingMail({
          from: 'no-reply@example.com',
          to: `${email}`,
          subject: 'Account Verification Link',
          text: `Dear ${firstname} ${lastname} 
                Please verify your email by clicking this link :
                ${env.CLIENT_ADDRESS}/verify-email/${newUser._id}/${token}
                 Regard`
        })

        // if token is not created, send a status of StatusCodes.BAD_REQUEST
      } else {
        next(new ApiError(StatusCodes.BAD_REQUEST, 'Token not created'))
      }
      await newUser.save()

      res.status(StatusCodes.CREATED).send({
        user: newUser,
        access_token: token

      })
    } else {
      next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user data'))
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const login = async (req, res, next) => {
  try {
    const email = req.body.email && req.body.email.trim()

    if (!email) {
      next(new ApiError(StatusCodes.BAD_REQUEST, 'Email is required'))
    }

    const user = await User.findOne({ email })

    if (user) {
      if (user.isVerified) {
        const token = encodedToken(req.user._id)
        res.setHeader('Authorization', token)
        return res.status(StatusCodes.OK).send({
          user,
          access_token: token
        })
      } else {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Email is not verified'))
      }
    } else {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Email or password incorrect'))
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const logout = async (req, res, next) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 })
    res.status(StatusCodes.OK).send({ message: 'Logged out' })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const { token, id } = req.params
    console.log(token, id)
    const isValidToken = isTokenValid(token)
    if (!isValidToken) {
      next(new ApiError(StatusCodes.BAD_REQUEST, 'Your verification link may have expired. Please click on resend to verify your Email.'))
    } else {
      const user = await User.findOne({ _id: id })

      if (!user) {
        next(new ApiError(StatusCodes.BAD_REQUEST, 'User not found'))
      } else if (user.isVerified) {
        return res.status(StatusCodes.OK).send({
          message: 'Email is already verified. Please login'
        })
      } else {
        const verifiedUser = await User.findByIdAndUpdate(
          id,
          { isVerified: true },
          { new: true, useFindAndModify: false }
        )
        if (!verifiedUser) {
          next(new ApiError(StatusCodes.BAD_REQUEST, 'Error when verified'))
        } else {
          return res.status(StatusCodes.OK).send({
            message: 'Email is verified successfully'
          })
        }
      }
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
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
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const sendEmailResetPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) next(new ApiError(StatusCodes.BAD_REQUEST, 'Email not found'))

    const user = await User.findOne({ email })
    if (!user) next(new ApiError(StatusCodes.BAD_REQUEST, 'User with this email not exist'))
    if (!user.isVerified) next(new ApiError(StatusCodes.BAD_REQUEST, 'Email is not verified. Please verified'))

    const token = encodedToken(user._id)
    if (!token) next(new ApiError(StatusCodes.BAD_REQUEST, 'Create token failed'))
    await sendingMail({
      from: 'no-reply@example.com',
      to: `${email}`,
      subject: 'Reset Password',
      text: `Dear ${user.firstname} ${user.lastname} 
                Your password has been reset.
                Create new password by clicking this link :
                ${env.CLIENT_ADDRESS}/reset-password/${user._id}/${token}
                 Regards`
    })

    res.status(StatusCodes.OK).send({ message: 'Email sent' })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const ResetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params
    const { password } = req.body

    if (!id || !token) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'User id or token not found'))
    }

    const tokenValid = await isTokenValid(token)
    if (!tokenValid) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Token is invalid'))
    }

    const user = await User.findByIdAndUpdate(
      id,
      { password },
      { new: true, useFindAndModify: false }
    )

    if (!user) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Update password failed'))
    }

    await user.save()

    res.status(StatusCodes.OK).send(user)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
