import Message from '../models/message.model.js'
import User from '../models/user.model.js'
import Chat from '../models/chat.model.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { getReceiverSocketId, io } from '../socket/socket.js'

export const sendMessage = async (req, res, next) => {
  const { content, chatId } = req.body

  if (!content || !chatId) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid data passed into request'))
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate('sender', 'profilePic')
    message = await message.populate('chat')
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'firstname lastname profilePic email'
    })

    const chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
    const receiverId = chat.users.find(user => user._id.toString() !== req.user._id.toString())._id.toString()

    // Socket emit
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message)
    }

    res.json(message)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
export const getAllMessagesFromChat = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', '-password')
      .populate('chat')
    res.json(messages)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
