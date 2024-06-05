import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/apiError.js'
import Project from '../models/project.model.js'
import Sprint from '../models/sprint.model.js'
import Issue from '../models/issue.model.js'
import User from '../models/user.model.js'

export const createProject = async (req, res, next) => {
  try {
    req.body.members.push(req.user)
    const { name, members } = req.body
    const project = await Project.create({
      name, members, projectManager: req.user._id
    })

    res.status(StatusCodes.CREATED).send(
      project
    )
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getProjectList = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { name } = req.query
    const query = {
      $or: [
        { projectManager: userId },
        { members: userId }
      ]
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' }
    }

    const projects = await Project.find(query)
      .populate('members issues projectManager')
      .sort({ updatedAt: -1 })

    res.status(StatusCodes.OK).send(projects)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getProjectDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const project = await Project.findById(id)
      .populate('members projectManager', '-password')
      .populate('activeSprint')

    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: 'Project not found' })
    }

    // Check if the current user is the project manager
    const isProjectManager = project.projectManager._id.toString() === userId.toString()

    // Populate issues based on whether the user is the project manager
    await project.populate({
      path: 'issues',
      match: isProjectManager ? {} : { assignee: userId },
      select: '-password'
    })

    res.status(StatusCodes.OK).send(project)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) next(new ApiError(StatusCodes.BAD_REQUEST, 'Project not found'))
    if (project._id.equals(req.user._id)) next(new ApiError(StatusCodes.BAD_REQUEST, 'Only project manager are allowed to do this'))
    else {
      await Project.findByIdAndDelete(req.params.id)

      res.status(StatusCodes.OK).send({ message: 'Deleted successfully' })
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) next(new ApiError(StatusCodes.BAD_REQUEST, 'Project not found'))

    if (project._id.equals(req.user._id)) next(new ApiError(StatusCodes.BAD_REQUEST, 'Only project manager are allowed to do this'))

    else {
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

      res.status(StatusCodes.OK).send(project)
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getProjectBacklogList = async (req, res, next) => {
  try {
    const projectId = req.params.id

    const project = await Project.findById(projectId).populate({
      path: 'backlog',
      model: Sprint,
      populate: {
        path: 'issues',
        model: Issue,
        populate: {
          path: 'assignee',
          model: User
        }
      }
    })

    if (!project) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Project not found'))
    }

    const backlogSprints = project.backlog || []

    return res.status(StatusCodes.OK).send(backlogSprints)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
