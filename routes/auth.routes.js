import express from 'express'
import { googleLogin, login, logout, signup } from '../controllers/auth.controllers.js'
import { schemas, validateBody } from '../helpers/routerHelpers.js'
import { handleAuthentication } from '../middleware/passport.js'

const router = express.Router()

router.post('/login', validateBody(schemas.authLoginSchema), (req, res, next) => {
  handleAuthentication('local', req, res, next)
}, login)

router.post('/signup', validateBody(schemas.authSignUpSchema), signup)

router.post('/logout', logout)

router.post('/google-login', (req, res, next) => {
  handleAuthentication('google-plus-token', req, res, next)
}, googleLogin)

export default router
