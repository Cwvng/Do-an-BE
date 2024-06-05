import express from 'express'
import { handleAuthentication } from '../middleware/passport.js'
import { createProjectSprint } from '../controllers/sprint.controller.js'

const router = express.Router()
router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createProjectSprint)

export default router
