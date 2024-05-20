import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import GooglePlusTokenStrategy from 'passport-google-plus-token'
import User from '../models/user.model.js'
import dotenv from 'dotenv'
import { env } from '../config/enviroment.config.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

dotenv.config()

// use for protected route
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
  secretOrKey: env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)
    if (!user) return done(null, false)
    done(null, user)
  } catch (error) {
    done(error, false)
  }
}))

// use for login
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email })
    if (!user) return done(null, false)

    const isCorrectPassword = await user.isCorrectPassword(password)
    if (!isCorrectPassword) return done(null, false)
    done(null, user)
  } catch (error) {
    done(error, false)
  }
}))

// use for google login
passport.use(new GooglePlusTokenStrategy({
  clientID: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOne({
      authGoogleID: profile.id,
      authType: 'google'
    })
    if (user) return done(null, user)

    const newUser = new User({
      authType: 'google',
      authGoogleID: profile.id,
      email: profile.emails[0].value,
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      profilePic: profile.photos[0].value
    })
    if (newUser) {
      await newUser.save()
      done(null, newUser)
    }
  } catch (error) {
    done(error, false)
  }
}))
// Middleware để xử lý kết quả xác thực của Passport
export const handleAuthentication = (strategy, req, res, next) => {
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
