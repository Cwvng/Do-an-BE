import express from 'express'
import { handleAuthentication } from '../middleware/passport.js'
import { createProjectSprint, getSprintDailySummaries, getSprintDetails } from '../controllers/sprint.controller.js'

const router = express.Router()
router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createProjectSprint)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getSprintDetails)
router.get('/:id/summary', (req, res, next) => handleAuthentication('jwt', req, res, next), getSprintDailySummaries)

export default router
