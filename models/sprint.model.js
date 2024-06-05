import mongoose from 'mongoose'

const sprintSchema = new mongoose.Schema({
  ordinary: { type: String, trim: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  sprintGoal: { type: String, trim: true }

}, { timestamps: true })

const Sprint = mongoose.model('Sprint', sprintSchema)
export default Sprint
