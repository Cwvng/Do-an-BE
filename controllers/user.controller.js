import User from '../models/user.model.js'
import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import { v2 as cloudinary } from 'cloudinary'
import Issue from '../models/issue.model.js'

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

export const getUserIssueSummary = async (req, res, next) => {
  try {
    const userId = req.params.userId
    const { sprintId } = req.query

    if (!userId) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'User ID is required'))
    }

    const query = { assignee: userId }
    if (sprintId) {
      query.sprint = sprintId
    }

    const issues = await Issue.find(query).populate({
      path: 'history',
      populate: {
        path: 'updatedBy',
        select: 'firstname lastname profilePic'
      }
    })

    let issuesCompletedOnTime = 0
    let issuesCompletedWithoutFeedback = 0
    let totalIssuesDone = 0

    for (const issue of issues) {
      const histories = issue.history

      if (histories.length === 0) continue

      const mostRecentStatus = histories.findLast((item) => item.field === 'status' && item.newValue === 'done')
      if (mostRecentStatus) {
        totalIssuesDone++

        if (new Date(mostRecentStatus.updatedAt) <= new Date(issue.dueDate)) {
          issuesCompletedOnTime++
        }

        const hasFeedback = histories.some(
          (history) => history.field === 'status' && history.newValue === 'feedback'
        )

        if (!hasFeedback) {
          issuesCompletedWithoutFeedback++
        }
      }
    }

    let rating = 0
    if (totalIssuesDone > 0) {
      rating = ((issuesCompletedOnTime * 0.5) + (issuesCompletedWithoutFeedback * 0.5)) / totalIssuesDone
    }

    await User.findByIdAndUpdate(userId, { rating })

    res.status(StatusCodes.OK).send({
      issuesCompletedOnTime,
      issuesCompletedWithoutFeedback,
      rating
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
