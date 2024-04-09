import express from 'express'
import { getAllOtherUsers } from '../controllers/user.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getAllOtherUsers)
export default router
