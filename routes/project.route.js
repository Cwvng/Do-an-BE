import express from 'express'
import { handleAuthentication } from '../middleware/passport.js'
import {
  createProject,
  deleteProject,
  getProjectList,
  getProjectDetail, updateProject
} from '../controllers/project.controller.js'

const router = express.Router()

router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createProject)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getProjectList)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getProjectDetail)
router.delete('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteProject)
router.patch('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), updateProject)

export default router
