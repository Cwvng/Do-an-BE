import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import Chat from '../models/chat.model.js'
import User from '../models/user.model.js'

export const accessChat = async (req, res, next) => {
  const { userId } = req.body

  if (!userId) return next(new ApiError(StatusCodes.BAD_REQUEST, 'User Id not found'))

  try {
    console.log(req.user._id, userId)
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } }
      ]
    }).populate('users', '-password')
      .populate('latestMessage')
    console.log(isChat)
    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'firstname lastname email profilePic'
    })
    console.log(isChat)

    if (isChat.length > 0) {
      res.send(isChat[0])
    } else {
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId]
      }
      const createdChat = await Chat.create(chatData)
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password')
      res.status(200).send(fullChat)
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getAllChats = async (req, res, next) => {
  try {
    await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name profilePic email'
        })
        res.status(200).send(results)
      })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
