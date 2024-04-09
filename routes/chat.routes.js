import express from 'express'
import { accessChat, getAllChats } from '../controllers/chat.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), accessChat)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getAllChats)
export default router
