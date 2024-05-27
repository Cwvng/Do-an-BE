import express from 'express'
import { getUserList, updateUser } from '../controllers/user.controller.js'
import { handleAuthentication } from '../middleware/passport.js'

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
router.patch('/', (req, res, next) => handleAuthentication('jwt', req, res, next), updateUser)
export default router
