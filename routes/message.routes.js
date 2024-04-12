import express from 'express'
import { getAllMessagesFromChat, sendMessage } from '../controllers/message.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), sendMessage)
router.get('/:chatId', (req, res, next) => handleAuthentication('jwt', req, res, next), getAllMessagesFromChat)

export default router
