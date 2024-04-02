import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import GooglePlusTokenStrategy from 'passport-google-plus-token'
import User from '../models/user.model.js'
import dotenv from 'dotenv'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

dotenv.config()

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)
    if (!user) return done(null, false)
    done(null, user)
  } catch (error) {
    done(error, false)
  }
}))

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

passport.use(new GooglePlusTokenStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
