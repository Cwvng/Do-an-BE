import express from 'express'
import {
  createChat,
  createGroupChat,
  deleteChat,
  getChatDetail,
  getChatList,
  updateChat
} from '../controllers/chat.controller.js'
import { handleAuthentication } from '../middleware/passport.js'
import { getMessageList } from '../controllers/message.controller.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createChat)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getChatDetail)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getChatList)
router.get('/:chatId/messages', (req, res, next) => handleAuthentication('jwt', req, res, next), getMessageList)
router.delete('/:chatId', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteChat)
router.post('/group', (req, res, next) => handleAuthentication('jwt', req, res, next), createGroupChat)
router.put('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), updateChat)
export default router
