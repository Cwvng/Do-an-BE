import Message from '../models/message.model.js'
import User from '../models/user.model.js'
import Chat from '../models/chat.model.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { getReceiverSocketId, io } from '../socket/socket.js'

export const createMessage = async (req, res, next) => {
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
    const senderSocketId = getReceiverSocketId(req.user._id)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message)
      io.to(receiverSocketId).emit('updateChatList', message)
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit('updateChatList', message)
    }

    res.status(StatusCodes.OK).send(message)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
export const getMessageList = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', '-password')
      .populate('chat')
    res.status(StatusCodes.OK).send(messages)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
