import express from 'express'
import { handleAuthentication } from '../middleware/passport.js'
import {
  createProjectSprint, deleteSprint,
  getSprintDailySummaries,
  getSprintDetails,
  updateSprint
} from '../controllers/sprint.controller.js'

const router = express.Router()
router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createProjectSprint)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getSprintDetails)
router.patch('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), updateSprint)
router.delete('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteSprint)
router.get('/:id/summary', (req, res, next) => handleAuthentication('jwt', req, res, next), getSprintDailySummaries)

export default router
