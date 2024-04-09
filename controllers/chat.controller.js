import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import Chat from '../models/chat.model.js'
import User from '../models/user.model.js'

export const accessChat = async (req, res, next) => {
  try {
    console.log(req.body)
    const { userId } = req.body

    if (!userId) next(new ApiError(StatusCodes.BAD_REQUEST, 'User Id not found'))

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { user: { $elemMatch: { $eq: req.user._id } } },
        { user: { $elemMatch: { $eq: userId } } }
      ]
    }).populate('users', '-password')
      .populate('latestMessage')

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'firstname lastname email profilePic'
    })
    console.log(isChat)
    if (isChat.length > 0) {
      res.send(isChat[0])
    } else {
      var chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId]
      }
    }
    const createdChat = await Chat.create(chatData)

    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password')
    res.status(200).send(fullChat)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getAllChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    res.status(200).send(chats)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
