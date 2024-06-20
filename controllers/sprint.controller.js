import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/apiError.js'
import Sprint from '../models/sprint.model.js'
import Project from '../models/project.model.js'
import History from '../models/history.model.js'
import Issue from '../models/issue.model.js'
import DailySummary from '../models/dailySummary.model.js'
import User from '../models/user.model.js'

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
      .populate({
        path: 'members',
        model: User
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

    const dailySummaries = {}

    issues.forEach(issue => {
      const currentDate = new Date()
      const date = currentDate.toISOString().split('T')[0]
      const status = issue.status.toLowerCase()

      if (!dailySummaries[date]) {
        dailySummaries[date] = {
          in_progress: 0,
          new: 0,
          done: 0,
          total: 0
        }
      }

      dailySummaries[date][status]++
      dailySummaries[date].total++
    })

    await Promise.all(Object.entries(dailySummaries).map(async ([date, data]) => {
      let dailySummary = await DailySummary.findOne({ sprint: sprint._id, date })

      if (!dailySummary) {
        dailySummary = new DailySummary({
          sprint: sprint._id,
          date,
          ...data
        })
      } else {
        dailySummary.in_progress = data.in_progress
        dailySummary.new = data.new
        dailySummary.done = data.done
        dailySummary.total = data.total
      }

      console.log(dailySummary)

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
export const updateSprint = async (req, res, next) => {
  try {
    const { isActive, projectId } = req.body
    const { id } = req.params

    // Find the sprint to be updated
    const sprint = await Sprint.findById(id)

    if (!sprint) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Sprint not found'))
    }

    // IsAvtivate = true is "Start Sprint" actions, false is "Complete sprint" action
    sprint.isActive = isActive

    if (isActive) {
      // Find the project containing the sprint
      const project = await Project.findById(projectId)

      if (!project) {
        return next(new ApiError(StatusCodes.BAD_REQUEST, 'Project not found'))
      }

      // Deactivate the previous active sprint
      if (project.activeSprint) {
        await Sprint.findByIdAndUpdate(project.activeSprint, { isActive: false })
      }

      // Set the current sprint as the active sprint in the project
      project.activeSprint = sprint._id

      await project.save()
    } else {
      // If the sprint is deactivated, ensure it is removed from the activeSprint field in the project
      const project = await Project.findById(projectId)

      if (project && project.activeSprint.toString() === sprint._id.toString()) {
        project.activeSprint = null
        await project.save()
      }
    }

    // Save the updated sprint
    await sprint.save()

    res.status(StatusCodes.OK).send(sprint)
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}

export const deleteSprint = async (req, res, next) => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id)

    if (!sprint) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Sprint not found'))
    }

    await sprint.deleteOne()

    res.status(StatusCodes.OK).send({ message: 'Sprint deleted successfully' })
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message))
  }
}
