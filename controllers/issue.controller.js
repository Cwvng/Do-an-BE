import ApiError from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import Issue from '../models/issue.model.js'
import IssueComment from '../models/comment.model.js'
import User from '../models/user.model.js'
import Sprint from '../models/sprint.model.js'
import History from '../models/history.model.js'

export const createIssue = async (req, res, next) => {
  try {
    const assignee = req.body.assignee || req.user._id

    let images = []
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path)
    }

    const newIssue = await Issue.create({
      ...req.body,
      assignee,
      creator: req.user._id,
      images,
      sprint: req.body.sprintId
    })

    const updatedSprint = await Sprint.findByIdAndUpdate(
      req.body.sprintId,
      { $push: { issues: newIssue._id } },
      { new: true, useFindAndModify: false }
    )

    if (!updatedSprint) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: 'Sprint not found'
      })
    }

    const historyEntry = await History.create({
      field: 'issue',
      oldValue: null,
      newValue: JSON.stringify(newIssue),
      updatedBy: req.user._id
    })

    newIssue.history.push(historyEntry._id)
    await newIssue.save()

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
        path: 'history',
        populate: {
          path: 'updatedBy',
          select: 'firstname lastname profilePic'
        }
      })

    if (!issue) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Issue not found'))
    }

    res.status(StatusCodes.OK).send(issue)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getIssueList = async (req, res, next) => {
  try {
    const { sprintId, label, priority, assignee } = req.query

    if (!sprintId) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Sprint ID is required'))
    }

    const query = { sprint: sprintId }

    if (label) {
      query.label = { $regex: label, $options: 'i' }
    }

    if (priority) {
      const priorities = priority.split(',')
      query.priority = { $in: priorities }
    }

    if (assignee) {
      const assignees = assignee.split(',')
      query.assignee = { $in: assignees }
    }

    const issueList = await Issue.find(query)
      .populate('assignee', '-password')
      .populate({
        path: 'history',
        populate: {
          path: 'updatedBy',
          select: 'firstname lastname profilePic'
        }
      })
      .sort({ updatedAt: -1 })

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
          updatedBy: userId
        })
      }
    }

    const historyEntries = await History.insertMany(changes)
    const historyIds = historyEntries.map(entry => entry._id)

    issue.history.push(...historyIds)

    Object.assign(issue, updateData)
    await issue.save()

    res.status(StatusCodes.OK).send(issue)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const creatIssueComment = async (req, res, next) => {
  const { content } = req.body
  const { id } = req.params

  const newComment = {
    sender: req.user._id,
    content
  }

  try {
    let comment = await IssueComment.create(newComment)
    comment = await User.populate(comment, {
      path: 'sender',
      select: 'firstname lastname profilePic email'
    })
    const issue = await Issue.findByIdAndUpdate(id, { $push: { comments: comment } },
      { new: true, useFindAndModify: false })

    const historyEntry = await History.create({
      field: 'comment',
      oldValue: null,
      newValue: JSON.stringify(comment),
      updatedBy: req.user._id
    })

    issue.history.push(historyEntry._id)
    await issue.save()

    res.status(StatusCodes.OK).send(issue)
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const getIssueComments = async (req, res, next) => {
  try {
    const issueId = req.params.id

    const issue = await Issue.findById(issueId)
      .populate({
        path: 'comments',
        populate: {
          path: 'sender',
          select: 'firstname lastname profilePic'
        }
      })

    if (!issue) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Issue not found'))
    }

    issue.comments.sort((a, b) => b.createdAt - a.createdAt)

    res.status(StatusCodes.OK).send(issue.comments)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getIssueHistory = async (req, res, next) => {
  try {
    const issueId = req.params.id

    const issue = await Issue.findById(issueId).populate({
      path: 'history',
      populate: {
        path: 'updatedBy',
        select: 'firstname lastname profilePic'
      }
    })

    if (!issue) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Issue not found'))
    }

    res.status(StatusCodes.OK).send(issue.history)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
