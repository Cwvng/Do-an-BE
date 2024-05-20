import express from 'express'
import { handleAuthentication } from '../middleware/passport.js'
import {
  createIssue,
  deleteIssue,
  getIssueList,
  getIssueDetail,
  updateIssue
} from '../controllers/issue.controller.js'
import uploadCloud from '../config/cloudinary.config.js'

const router = express.Router()
router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), createIssue)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getIssueList)
router.delete('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteIssue)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getIssueDetail)
router.patch('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), uploadCloud.array('images', 3), updateIssue)

export default router
