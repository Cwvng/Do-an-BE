import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import connectDb from './db/connectDb.js'
import messageRoutes from './routes/message.routes.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware.js'
import { env } from './config/enviroment.config.js'
import chatRoutes from './routes/chat.routes.js'
import { app, server } from './socket/socket.js'
import issueRoute from './routes/issue.route.js'
import projectRoute from './routes/project.route.js'
import swaggerDocs from './swagger/swagger.js'
import sprintRoute from './routes/sprint.route.js'

const PORT = env.PORT || 5000

dotenv.config()

app.use(cors())
// app.use(logger('dev'))
app.use(express.json()) // parse incoming rq with JSON payload (from req.body)
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/issue', issueRoute)
app.use('/api/project', projectRoute)
app.use('/api/sprint', sprintRoute)

app.use(errorHandlingMiddleware)

server.listen(PORT, () => {
  connectDb()
  console.log(`Server is running on port ${PORT}`)
  swaggerDocs(app, PORT)
})
