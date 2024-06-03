import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  subject: { type: String, trim: true },
  description: { type: String, trim: true },
  status: { type: String, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'low' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentIssue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  dueDate: { type: Date, default: Date.now },
  images: [{ type: String }],
  remainingDays: { type: Number },
  history: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

// Pre-save middleware to calculate remainingDays
issueSchema.pre('save', function (next) {
  const currentDate = new Date()
  const dueDate = new Date(this.dueDate)
  this.remainingDays = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24))
  next()
})

const Issue = mongoose.model('Issue', issueSchema)
export default Issue
