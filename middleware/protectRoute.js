import jwt from 'jsonwebtoken'
import { env } from '../config/enviroment.js'
import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

const protectRoute = async (req, res, next) => {
  let token

  if (req.headers.authorization &&
  req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (err) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authorized, token failed'))
    }
  }
}

export default protectRoute
