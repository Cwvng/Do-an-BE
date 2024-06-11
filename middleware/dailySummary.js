import cron from 'node-cron'
import { calculateAndStoreDailySummary } from '../controllers/sprint.controller.js'

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running daily summary update...')
  try {
    // Call the controller function to calculate and store daily summary
    await calculateAndStoreDailySummary()
    console.log('Daily summary update completed.')
  } catch (error) {
    console.error('Error updating daily summary:', error)
  }
})
