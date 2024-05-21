import express from 'express'
import {
  googleLogin,
  login,
  logout, ResetPassword,
  sendEmailResetPassword,
  signup,
  verifyEmail
} from '../controllers/auth.controllers.js'
import { schemas, validateBody } from '../helpers/routerHelpers.js'
import { handleAuthentication } from '../middleware/passport.js'
import { getLoggedUserInfo } from '../controllers/user.controller.js'

const router = express.Router()
/**
 * @openapi
 * '/api/auth/login':
 *  post:
 *     tags:
 *     - Auth
 *     summary: Login
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: test@gmail.com
 *              password:
 *                type: string
 *                default: Test1234
 *     responses:
 *      201:
 *        description: Created
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.post('/login', validateBody(schemas.authLoginSchema), (req, res, next) => {
  handleAuthentication('local', req, res, next)
}, login)

/**
 * @openapi
 * '/api/auth/signup':
 *  post:
 *     tags:
 *     - Auth
 *     summary: Signup
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: test@gmail.com
 *              password:
 *                type: string
 *                default: Test1234
 *     responses:
 *      201:
 *        description: Created
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.post('/signup', validateBody(schemas.authSignUpSchema), signup)

router.post('/logout', logout)

router.post('/reset-password', sendEmailResetPassword)
router.post('/reset-password/:id/:token', ResetPassword)

router.get('/verify-email/:id/:token', verifyEmail)

router.post('/google-login', (req, res, next) => {
  handleAuthentication('google-plus-token', req, res, next)
}, googleLogin)
router.get('/user', (req, res, next) => handleAuthentication('jwt', req, res, next), getLoggedUserInfo)
export default router
