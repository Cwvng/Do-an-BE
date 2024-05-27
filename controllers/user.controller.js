import User from '../models/user.model.js'
import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'

export const getUserList = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { email: { $regex: req.query.keyword, $options: 'i' } },
            { firstname: { $regex: req.query.keyword, $options: 'i' } },
            { lastname: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {}
    const loggedUserId = req.user._id
    const allUsers = await User.find(keyword).find({ _id: { $ne: loggedUserId } })
    res.status(StatusCodes.OK).send(allUsers)
  } catch (err) {
    console.log('Error in userController: ', err.message)
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getLoggedUserInfo = async (req, res, next) => {
  try {
    const loggedUserId = req.user._id
    const user = await User.find({ _id: loggedUserId })
    res.status(StatusCodes.OK).send(user[0])
  } catch (err) {
    console.log('Error in userController/getUserInfoById: ', err.message)
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id
    if (!userId) next(new ApiError(StatusCodes.BAD_REQUEST, 'User not found'))

    if (!req.body) next(new ApiError(StatusCodes.BAD_REQUEST, 'No provided data'))

    const user = await User.findByIdAndUpdate(userId, req.body, { new: true, useFindAndModify: false })

    if (!user) next(new ApiError(StatusCodes.BAD_REQUEST), 'Update user failed')

    res.status(StatusCodes.OK).send(user)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
