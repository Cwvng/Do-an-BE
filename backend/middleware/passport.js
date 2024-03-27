import passport from 'passport';
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt'
import {Strategy as LocalStrategy} from 'passport-local'
import GooglePlusTokenStrategy from 'passport-google-plus-token'
import dotenv from "dotenv";
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET} from "../configs/index.js";
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

//passport Google
passport.use(new GooglePlusTokenStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("profile", profile.photos[0])

        // Check if user existed
        const user = await User.findOne({authGoogleId: profile.id, authType: 'google'})

        if (user) return done(null, user)

        // If new account
        const newUser = new User({
            authType: "google",
            email: profile.emails[0].value,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            profilePic:profile.photos[0].value,
            authGoogleId: profile.id
        })
        console.log(newUser)
        if (newUser) {
            await newUser.save()
            done(null, newUser)
        }
    } catch (error) {
        console.log(error)
        done(error, false)
    }
}))