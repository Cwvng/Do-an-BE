import express from 'express'
import {
  getChatDetail,
  addUserToGroupChat,
  createGroupChat, deleteChat,
  getChatList,
  removeUserFromGroupChat,
  renameGroupChat
} from '../controllers/chat.controller.js'
import { handleAuthentication } from '../middleware/passport.js'
import { getMessageList } from '../controllers/message.controller.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getChatDetail)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getChatList)
router.get('/:chatId', (req, res, next) => handleAuthentication('jwt', req, res, next), getMessageList)
router.delete('/:chatId', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteChat)
router.post('/group', (req, res, next) => handleAuthentication('jwt', req, res, next), createGroupChat)
router.put('/group', (req, res, next) => handleAuthentication('jwt', req, res, next), renameGroupChat)
router.put('/group-users', (req, res, next) => handleAuthentication('jwt', req, res, next), addUserToGroupChat)
router.delete('/group-users', (req, res, next) => handleAuthentication('jwt', req, res, next), removeUserFromGroupChat)
export default router
