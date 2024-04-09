import express from 'express'
import {
  accessChat,
  addUserToGroupChat,
  createGroupChat,
  getAllChats,
  removeUserFromGroupChat,
  renameGroupChat
} from '../controllers/chat.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), accessChat)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getAllChats)
router.post('/group', (req, res, next) => handleAuthentication('jwt', req, res, next), createGroupChat)
router.put('/group', (req, res, next) => handleAuthentication('jwt', req, res, next), renameGroupChat)
router.put('/group-users', (req, res, next) => handleAuthentication('jwt', req, res, next), addUserToGroupChat)
router.delete('/group-users', (req, res, next) => handleAuthentication('jwt', req, res, next), removeUserFromGroupChat)
export default router
