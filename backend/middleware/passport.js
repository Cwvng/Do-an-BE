import passport from 'passport';
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt'
import {Strategy as LocalStrategy} from 'passport-local'
import dotenv from "dotenv";
import {JWT_SECRET} from "../configs/index.js";
import User from "../models/user.model.js";

dotenv.config()

const opt = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: JWT_SECRET
}

passport.use(new JwtStrategy(opt, async (payload, done) => {
    try {
        const user = await User.findById(payload.sub)

        if (!user) return done(null, false)

        done(null, user)
    } catch (error) {
        done(error, false)
    }
}))

//passport local
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({email})

        if (!user) return done(null, false)

        const isCorrectPassword = await user.isValidPassword(password)

        if (!isCorrectPassword) return done(null, false)

        done(null, user)
    } catch (error) {
        done(error, false)
    }
}))