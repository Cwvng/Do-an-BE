import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import Issue from '../models/issue.model.js'
import Project from '../models/project.model.js'

export const createIssue = async (req, res, next) => {
  try {
    const newIssue = await Issue.create({
      ...req.body,
      creator: req.user._id
    })
    const updatedProject = await Project.findByIdAndUpdate(
      req.body.project,
      { $push: { issues: newIssue._id } },
      { new: true, useFindAndModify: false }
    )
    if (!updatedProject) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: 'Project not found'
      })
    }
    res.status(StatusCodes.CREATED).send(
      newIssue
    )
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getIssueDetail = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('assignee creator')
    if (issue) {
      res.status(StatusCodes.OK).send(issue)
    } else next(new ApiError(StatusCodes.BAD_REQUEST, 'Issue not found'))
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getIssueList = async (req, res, next) => {
  try {
    const { projectId } = req.query
    const { userId } = req.user._id
    const issueList = await Issue.find({
      $and: [
        {
          $or: [
            { assignee: userId },
            { creator: userId }
          ]
        },
        { project: projectId }
      ]
    }).populate('assignee', '-password').sort({ updatedAt: -1 })
    res.status(StatusCodes.OK).send({
      issues: issueList
    })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id)
    if (!issue) next(new ApiError(StatusCodes.BAD_REQUEST, 'Issue not found'))
    else res.status(StatusCodes.OK).send({ message: 'Deleted successfully' })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or missing issue ID'))
    }

    const updateData = { ...req.body }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path)
    }

    const issue = await Issue.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

    if (!issue) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Issue not found'))
    }

    res.status(StatusCodes.OK).send(issue)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
