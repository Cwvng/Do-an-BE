import jwt from 'jsonwebtoken'
import { env } from '../config/enviroment.config.js'

export const token = (userId, res) => {
  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: '15d'
  })
  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // ms
    httpOnly: true, // prevent XSS attack cross-site scripting attacks
    sameSite: 'strict', // CSRF attacks cross-site req forgery attacks
    secure: env.NODE_ENV !== 'development'
  })
}
export const encodedToken = (userId) => {
  return jwt.sign({
    iss: 'admin',
    sub: userId,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 3)

  }, env.JWT_SECRET)
}
export const isTokenValid = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    return { valid: true, decoded }
  } catch (err) {
    return { valid: false, error: err.message }
  }
}
