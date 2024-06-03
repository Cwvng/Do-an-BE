import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  content: { type: String },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true })

const IssueComment = mongoose.model('Comment', commentSchema)
export default IssueComment
