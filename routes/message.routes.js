import express from 'express'
import { sendMessage } from '../controllers/message.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), sendMessage)

export default router
