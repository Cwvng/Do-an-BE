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
  images: [{ type: String }]

  // TODO: comment,log,files
}, { timestamps: true })

const Issue = mongoose.model('Issue', issueSchema)
export default Issue
