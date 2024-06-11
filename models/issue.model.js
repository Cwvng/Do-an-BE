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
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  dueDate: { type: Date, default: Date.now },
  images: [{ type: String }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'History' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  estimateTime: { type: Number },
  loggedTime: { type: Number, default: 0 }
}, { timestamps: true, required: true })

const Issue = mongoose.model('Issue', issueSchema)
export default Issue
