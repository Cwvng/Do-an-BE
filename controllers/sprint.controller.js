import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/apiError.js'
import Sprint from '../models/sprint.model.js'
import Project from '../models/project.model.js'
import History from '../models/history.model.js'
import Issue from '../models/issue.model.js'
import DailySummary from '../models/dailySummary.model.js'

export const createProjectSprint = async (req, res, next) => {
  try {
    const { members, projectId } = req.body

    const userId = req.user._id

    if (!members.includes(userId)) {
      members.push(userId)
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Project not found'))
    }

    let ordinary = 1
    if (project.activeSprint) {
      ordinary = +project.backlog.length + 1
    }

    const isActive = !project.activeSprint

    const newSprint = await Sprint.create({ ...req.body, ordinary, members, isActive })

    if (!newSprint) return next(new ApiError(StatusCodes.BAD_REQUEST, 'Create sprint failed'))

    if (!isActive) {
      await Sprint.updateMany(
        { _id: { $ne: newSprint._id }, project: projectId },
        { $set: { isActive: false } }
      )
    }

    const updateData = {
      $push: { backlog: newSprint._id }
    }

    if (isActive) {
      updateData.activeSprint = newSprint._id
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true }
    )

    if (!updatedProject) {
      return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Project update failed'))
    }

    res.status(StatusCodes.CREATED).send(newSprint)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const getSprintDetails = async (req, res, next) => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id)
      .populate({
        path: 'issues',
        populate: {
          path: 'history',
          model: History,
          populate: {
            path: 'updatedBy',
            select: 'firstname lastname profilePic'
          }
        }
      })

    if (!sprint) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Sprint not found'))
    }

    res.status(StatusCodes.OK).send(sprint)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const calculateAndStoreDailySummary = async () => {
  const sprints = await Sprint.find({ isActive: true })

  for (const sprint of sprints) {
    const issues = await Issue.find({ sprint: sprint._id })

    // Create an object to store daily summaries
    const dailySummaries = {}

    issues.forEach(issue => {
      const currentDate = new Date()
      const date = currentDate.toISOString().split('T')[0]
      const status = issue.status.toLowerCase()

      // Initialize daily summary if not exists
      if (!dailySummaries[date]) {
        dailySummaries[date] = {
          in_progress: 0,
          new: 0,
          done: 0
        }
      }

      // Update count for the corresponding status
      dailySummaries[date][status]++
    })

    // Save or update DailySummary entries for each date
    await Promise.all(Object.entries(dailySummaries).map(async ([date, data]) => {
      // Find or create the daily summary for the current date
      let dailySummary = await DailySummary.findOne({ sprint: sprint._id, date })

      if (!dailySummary) {
        // If not exists, create a new one
        dailySummary = new DailySummary({
          sprint: sprint._id,
          date,
          ...data
        })
      } else {
        // If exists, update the counts
        dailySummary.in_progress = data.in_progress
        dailySummary.new = data.new
        dailySummary.done = data.done
      }

      // Save the daily summary
      await dailySummary.save()
    }))

    // Update the sprint's dailySummary field with the new entries
    sprint.dailySummary = await DailySummary.find({ sprint: sprint._id })
    await sprint.save()
  }
}

export const getSprintDailySummaries = async (req, res, next) => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id).populate('dailySummary')

    if (!sprint) {
      next(new ApiError(StatusCodes.BAD_REQUEST, 'Sprint not found'))
    }

    // Return the daily summaries
    return res.status(StatusCodes.OK).json(sprint.dailySummary)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
