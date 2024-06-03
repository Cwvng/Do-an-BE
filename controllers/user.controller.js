import User from '../models/user.model.js'
import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import { v2 as cloudinary } from 'cloudinary'

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
    const userId = req.user?._id
    if (!userId) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'User not found'))
    }

    if (!req.body && !req.files) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'No provided data'))
    }

    const updateData = { ...req.body }

    if (req.files && req.files.length > 0) {
      updateData.profilePic = req.files.map(file => file.path)[0]

      // Delete old avatar in cloudinary server
      const oldUser = await User.findById(userId)
      if (oldUser && oldUser.profilePic) {
        const imageName = 'doan20232/' + oldUser.profilePic.split('/').pop().split('.')[0]

        await cloudinary.api.delete_resources(imageName, (error, result) => {
          console.log(error, result)
        })
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, useFindAndModify: false })

    if (!user) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Update user failed'))
    }

    res.status(StatusCodes.OK).send(user)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
