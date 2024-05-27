import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import Issue from '../models/issue.model.js'
import Project from '../models/project.model.js'

export const createIssue = async (req, res, next) => {
  try {
    const assignee = req.body.assignee || req.user._id

    const newIssue = await Issue.create({
      ...req.body,
      assignee,
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

    res.status(StatusCodes.CREATED).send(newIssue)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getIssueDetail = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('assignee creator')
      .populate({
        path: 'history.updatedBy',
        select: 'firstname lastname profilePic'
      })

    if (issue) {
      res.status(StatusCodes.OK).send(issue)
    } else {
      next(new ApiError(StatusCodes.BAD_REQUEST, 'Issue not found'))
    }
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
export const getIssueList = async (req, res, next) => {
  try {
    const { projectId, name } = req.query
    const userId = req.user._id

    const project = await Project.findById(projectId)
    if (!project) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Project not found'))
    }

    let nameQuery = {}
    if (name) {
      nameQuery = { name: { $regex: name, $options: 'i' } }
    }

    let issueList
    if (project.projectManager.toString() === userId.toString()) {
      issueList = await Issue.find({ project: projectId, ...nameQuery })
        .populate('assignee', '-password')
        .sort({ updatedAt: -1 })
    } else {
      issueList = await Issue.find({
        $and: [
          {
            $or: [{ assignee: userId }]
          },
          { project: projectId },
          nameQuery
        ]
      }).populate('assignee', '-password').sort({ updatedAt: -1 })
    }

    res.status(StatusCodes.OK).send(issueList)
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
    const userId = req.user._id

    if (!id) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or missing issue ID'))
    }

    const issue = await Issue.findById(id)
    if (!issue) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Issue not found'))
    }

    const updateData = { ...req.body }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path)
    }

    const changes = []
    for (const key in updateData) {
      if (issue[key] !== updateData[key]) {
        changes.push({
          field: key,
          oldValue: issue[key],
          newValue: updateData[key],
          updatedBy: userId,
          updatedAt: new Date()
        })
      }
    }
    if (changes.length > 0) {
      issue.history?.push(...changes)
    }

    Object.assign(issue, updateData)
    await issue.save()

    res.status(StatusCodes.OK).send(issue)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
