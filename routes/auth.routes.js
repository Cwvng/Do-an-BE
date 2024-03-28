import express from "express";
import {login, logout, secret, signup} from "../controllers/auth.controllers.js";
import {schemas, validateBody} from "../helpers/routerHelpers.js";

const router = express.Router();

router.post("/login",validateBody(schemas.authLoginSchema), login)
router.post("/signup",validateBody(schemas.authSignUpSchema), signup)
router.post("/logout", logout)

router.get("/secret", secret)
export default router;