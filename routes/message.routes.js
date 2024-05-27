import express from 'express'
import { createMessage, deleteMessage, updateMessage } from '../controllers/message.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createMessage)
router.delete('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteMessage)
router.patch('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), updateMessage)

export default router
