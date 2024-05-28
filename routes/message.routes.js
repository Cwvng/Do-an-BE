import express from 'express'
import {
  createMessage,
  deleteMessage,
  getMessageImagesList,
  updateMessage
} from '../controllers/message.controller.js'
import { handleAuthentication } from '../middleware/passport.js'
import uploadCloud from '../config/cloudinary.config.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), uploadCloud.array('images', 3), createMessage)
router.delete('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteMessage)
router.patch('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), updateMessage)
router.get('/:chatId/images', (req, res, next) => handleAuthentication('jwt', req, res, next), getMessageImagesList)

export default router
