import passport from 'passport'
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt'
import {Strategy as LocalStrategy} from 'passport-local'
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config()

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
    secretOrKey: process.env.JWT_SECRET
},async (payload, done)=>{
    try{
        const user = await User.findById(payload.sub)
        if(!user) return done(null, false)
        done(null, user)
    }catch (error){
        done(error, false)
    }
}))

passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done)=>{
    try{
        const user = await User.findOne({email})
        if(!user) return done(null, false)

        const isCorrectPassword = await user.isCorrectPassword(password)
        if(!isCorrectPassword) return done(null, false)
        done(null, user)
    }catch (error){
        done(error, false)
    }
}))