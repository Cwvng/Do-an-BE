import express from 'express'
import { handleAuthentication } from '../middleware/passport.js'
import {
  createIssue,
  creatIssueComment,
  deleteIssue, getIssueComments,
  getIssueDetail,
  getIssueList,
  updateIssue
} from '../controllers/issue.controller.js'
import uploadCloud from '../config/cloudinary.config.js'

const router = express.Router()
router.post('/', (req, res, next) => handleAuthentication('jwt', req, res, next), uploadCloud.array('images', 3), createIssue)
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getIssueList)
router.delete('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), deleteIssue)
router.get('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), getIssueDetail)
router.patch('/:id', (req, res, next) => handleAuthentication('jwt', req, res, next), uploadCloud.array('images', 3), updateIssue)
router.post('/:id/comment', (req, res, next) => handleAuthentication('jwt', req, res, next), creatIssueComment)
router.get('/:id/comment', (req, res, next) => handleAuthentication('jwt', req, res, next), getIssueComments)

export default router
