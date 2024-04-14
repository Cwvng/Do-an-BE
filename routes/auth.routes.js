import express from 'express'
import { googleLogin, login, logout, signup } from '../controllers/auth.controllers.js'
import { schemas, validateBody } from '../helpers/routerHelpers.js'
import { handleAuthentication } from '../middleware/passport.js'
import { getLoggedUserInfo } from '../controllers/user.controller.js'

const router = express.Router()

router.post('/login', validateBody(schemas.authLoginSchema), (req, res, next) => {
  handleAuthentication('local', req, res, next)
}, login)

router.post('/signup', validateBody(schemas.authSignUpSchema), signup)

router.post('/logout', logout)

router.post('/google-login', (req, res, next) => {
  handleAuthentication('google-plus-token', req, res, next)
}, googleLogin)
router.get('/user', (req, res, next) => handleAuthentication('jwt', req, res, next), getLoggedUserInfo)

export default router
