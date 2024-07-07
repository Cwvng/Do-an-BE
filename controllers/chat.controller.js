import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import Chat from '../models/chat.model.js'
import User from '../models/user.model.js'

export const getChatDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    console.log(id)

    const chat = await Chat.findById(id).populate('users')

    res.status(StatusCodes.OK).send(chat)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const createChat = async (req, res, next) => {
  const { userId } = req.body

  if (!userId) return next(new ApiError(StatusCodes.BAD_REQUEST, 'User Id not found'))

  const sender = await User.findById(userId)
  if (!sender) return next(new ApiError(StatusCodes.BAD_REQUEST, 'User not found'))

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
      console.log(sender)
      const chatData = {
        chatName: sender.firstname + sender.lastname,
        isGroupChat: false,
        users: [req.user._id, userId]
      }
      const createdChat = await Chat.create(chatData)
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password')
      res.status(StatusCodes.OK).send(fullChat)
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getChatList = async (req, res, next) => {
  try {
    const { name } = req.query
    const chatQuery = { users: { $elemMatch: { $eq: req.user._id } } }

    if (name) {
      chatQuery.chatName = { $regex: name, $options: 'i' }
    }

    await Chat.find(chatQuery)
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'firstname lastname profilePic email'
        })
        res.status(StatusCodes.OK).send(results)
      })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const createGroupChat = async (req, res, next) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Please fill all the fields' })
    }
    console.log(req.body.users)
    if (req.body.users.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Group chat required more than 2 users' })
    }
    req.body.users.push(req.user)

    const groupChat = await Chat.create({
      chatName: req.body.name.trim(),
      users: req.body.users,
      isGroupChat: true,
      groupAdmin: req.user
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')

    res.status(StatusCodes.CREATED).send(fullGroupChat)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.chatId)

    res.status(StatusCodes.OK).send({
      message: 'Removed an user to group chat successfully',
      chat
    })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const updateChat = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) res.status(StatusCodes.BAD_REQUEST).send({ message: 'Chat id not found' })

    const { chatName, users } = req.body

    const updatedData = { users }

    if (chatName) updatedData.chatName = chatName

    const updatedChat = await Chat.findByIdAndUpdate(id, updatedData, { new: true, useFindAndModify: false })

    if (!updatedChat) res.status(StatusCodes.BAD_REQUEST).send({ message: 'Chat update failed' })

    res.status(StatusCodes.OK).send(updatedChat)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
