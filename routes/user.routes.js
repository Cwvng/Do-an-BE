import express from 'express'
import protectRoute from '../middleware/protectRoute.js'
import { getAllOtherUsers } from '../controllers/user.controller.js'

const router = express.Router()
router.get('/', protectRoute, getAllOtherUsers)
export default router
