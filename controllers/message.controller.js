import Message from '../models/message.model.js'
import User from '../models/user.model.js'
import Chat from '../models/chat.model.js'
import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import { getReceiverSocketId, io } from '../socket/socket.js'

export const createMessage = async (req, res, next) => {
  const { content, chatId } = req.body
  if (!chatId) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid data passed into request'))
  }

  const newMessage = {
    sender: req.user._id,
    chat: chatId
  }

  if (content) newMessage.content = content
  if (req.files && req.files.length > 0) {
    newMessage.images = req.files.map(file => file.path)
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
    const { chatId } = req.params
    const { page = 1 } = req.query

    const messages = await Message.find({ chat: chatId })
      .populate('sender', '-password')

    // Paginate the messages

    const startIndex = (page - 1) * 15

    const paginatedMessages = messages.slice((messages.length - 15 - startIndex) >= 0 ? messages.length - 15 - startIndex : 0, messages.length)
    res.status(StatusCodes.OK).send({ messages: paginatedMessages, total: messages.length })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
export const deleteMessage = async (req, res, next) => {
  try {
    const messages = await Message.findByIdAndDelete(req.params.id)

    if (!messages) next(new ApiError(StatusCodes.BAD_REQUEST, 'Message not found'))

    res.status(StatusCodes.OK).send(messages)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) next(new ApiError(StatusCodes.BAD_REQUEST, 'Message id not found'))

    let message = await Message.findById(id)
    if (!message) next(new ApiError(StatusCodes.BAD_REQUEST, 'Message not found'))

    if (!message.isUpdated) { message = await Message.findByIdAndUpdate(id, { ...req.body, isUpdated: true }) }

    res.status(StatusCodes.OK).send(message)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
export const getMessageImagesList = async (req, res, next) => {
  try {
    if (!req.params.chatId) next(new ApiError(StatusCodes.BAD_REQUEST, 'No chat id provided'))

    const messages = await Message.find({ chat: req.params.chatId })
    const imageUrls = messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .flatMap(message => message.images.map(image => ({ image, createdAt: message.createdAt })))
      .filter(imageUrl => imageUrl !== undefined && imageUrl !== null && imageUrl !== '')

    res.status(StatusCodes.OK).send(imageUrls)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}
