import mongoose from 'mongoose'

const dailySummarySchema = new mongoose.Schema({
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', required: true },
  date: { type: Date, required: true },
  in_progress: { type: Number, default: 0 },
  new: { type: Number, default: 0 },
  done: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
})

const DailySummary = mongoose.model('DailySummary', dailySummarySchema)
export default DailySummary
