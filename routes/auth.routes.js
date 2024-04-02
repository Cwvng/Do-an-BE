import express from 'express'
import { googleLogin, login, logout, secret, signup } from '../controllers/auth.controllers.js'
import { schemas, validateBody } from '../helpers/routerHelpers.js'
import passport from 'passport'
import '../middleware/passport.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

// Middleware để xử lý kết quả xác thực của Passport
const handleAuthentication = (strategy, req, res, next) => {
  return passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) {
      next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
    }
    if (!user) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Email or password incorrect'))
    }
    req.user = user
    next()
  })(req, res, next)
}

router.post('/login', validateBody(schemas.authLoginSchema), (req, res, next) => {
  handleAuthentication('local', req, res, next)
}, login)

router.post('/signup', validateBody(schemas.authSignUpSchema), signup)

router.post('/logout', logout)

router.post('/google-login', (req, res, next) => {
  handleAuthentication('google-plus-token', req, res, next)
}, googleLogin)

router.get('/secret', (req, res, next) => {
  handleAuthentication('jwt', req, res, next)
}, secret)

export default router
