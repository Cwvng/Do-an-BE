import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import Project from '../models/project.model.js'

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
    const projects = await Project.find({
      $or: [
        { projectManager: userId },
        { members: userId }
      ]
    }).populate('members issues projectManager').sort({ updatedAt: -1 })

    res.status(StatusCodes.CREATED).send(
      projects
    )
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getProjectDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    // First, find the project to check the projectManager
    const project = await Project.findById(id)
      .populate('members', '-password')

    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: 'Project not found' })
    }

    // Check if the current user is the project manager
    const isProjectManager = project.projectManager.toString() === userId.toString()

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