import Joi from 'joi'
import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'

export const validateBody = (schema) => {
  return (req, res, next) => {
    const validatorResult = schema.validate(req.body)

    if (validatorResult.error) {
      next(new ApiError(StatusCodes.BAD_REQUEST, validatorResult.error))
    } else {
      if (!req.value) req.value = {}
      if (!req.value.body) req.value.body = {}

      req.value.body = validatorResult.value
      next()
    }
  }
}
export const validateParams = (schema, name) => {
  return (req, res, next) => {
    const validatorResult = schema.validate({ param: req.params[name] })

    if (validatorResult.error) {
      return res.status(StatusCodes.BAD_REQUEST).send(validatorResult.error)
    } else {
      if (!req.value) req.value = {}
      if (!req.value.params) req.value.params = {}

      req.value.params[name] = req.params[name]
      next()
    }
  }
}

export const schemas = {
  idSchema: Joi.object().keys({
    param: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  }),
  authSignUpSchema: Joi.object().keys({
    firstname: Joi.string().min(2).required(),
    lastname: Joi.string().min(2).required(),
    email: Joi.string().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).required(),
    password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/).required(),
    confirmPassword: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/).required(),
    gender: Joi.string().required()
  }),

  authLoginSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  })
}
