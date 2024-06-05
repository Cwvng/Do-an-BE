import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/apiError.js'
import Sprint from '../models/sprint.model.js'
import Project from '../models/project.model.js'

export const createProjectSprint = async (req, res, next) => {
  try {
    const { members, projectId } = req.body

    const userId = req.user._id

    members.push(userId)

    const project = await Project.findById(projectId)

    if (!project) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Project not found'))
    }

    let ordinary = 1
    if (project.activeSprint) {
      ordinary = project.activeSprint.ordinary + 1
    }

    // Create new sprint object with updated ordinary
    const newSprint = await Sprint.create({ ...req.body, ordinary, members })

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { activeSprint: newSprint, $push: { backlog: newSprint } },
      { new: true }
    )

    if (!updatedProject) {
      next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Project update failed'))
    }

    res.status(StatusCodes.CREATED).send(newSprint)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
