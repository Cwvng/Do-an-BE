import express from 'express'
import { getMessages, sendMessage } from '../controllers/message.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()
router.post('/send/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), sendMessage)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getMessages)
export default router
