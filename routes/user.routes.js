import express from 'express'
import { getUserIssueSummary, getUserList, updateUser } from '../controllers/user.controller.js'
import { handleAuthentication } from '../middleware/passport.js'
import uploadCloud from '../config/cloudinary.config.js'

const router = express.Router()
/**
 * @openapi
 * '/api/users':
 *  get:
 *     tags:
 *     - User
 *     summary: Get all users except logged user
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                  name:
 *                    type: string
 *       400:
 *         description: Bad request
 */
router.get('/', (req, res, next) => handleAuthentication('jwt', req, res, next), getUserList)
router.patch('/', (req, res, next) => handleAuthentication('jwt', req, res, next), uploadCloud.array('profilePic', 1), updateUser)
router.get('/:userId/issue-summary', (req, res, next) => handleAuthentication('jwt', req, res, next), uploadCloud.array('profilePic', 1), getUserIssueSummary)
export default router
