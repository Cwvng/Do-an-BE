import nodemailer from 'nodemailer'
import { env } from '../config/enviroment.config.js'

// Function to send email to the user
export const sendingMail = async ({ from, to, subject, text }) => {
  try {
    const mailOptions = {
      from,
      to,
      subject,
      text
    }

    // Assign createTransport method in nodemailer to a variable
    // service: to determine which email platform to use
    // auth contains the sender's email and password which are all saved in the .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD
      }

    })

    // Return the transporter variable which has the sendMail method to send the mail
    // which is within the mailOptions
    return await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error(error)
  }
}
