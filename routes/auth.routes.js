import express from "express";
import {googleLogin, login, logout, secret, signup} from "../controllers/auth.controllers.js";
import {schemas, validateBody} from "../helpers/routerHelpers.js";
import passport from "passport";
import '../middleware/passport.js'

const router = express.Router();

router.post("/login", validateBody(schemas.authLoginSchema),passport.authenticate('local', {session:false}), login)
router.post("/signup", validateBody(schemas.authSignUpSchema), signup)
router.post("/logout", logout)
router.post("/google-login", passport.authenticate('google-plus-token',{session:false}), googleLogin)

router.get("/secret", passport.authenticate('jwt', {session: false}), secret)
export default router;