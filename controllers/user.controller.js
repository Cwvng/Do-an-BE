import User from '../models/user.model.js'

export const getAllOtherUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword
            ? {
                $or: [
                    {email: {$regex: req.query.keyword, $options: "i"}},
                    {firstname: {$regex: req.query.keyword, $options: "i"}},
                    {lastname: {$regex: req.query.keyword, $options: "i"}}
                ]
            }
            : {};
        const loggedUserId = req.user._id
    const allUsers = await User.find(keyword).find({ _id: { $ne: loggedUserId } })
    res.status(200).json(allUsers)
  } catch (err) {
    console.log('Error in userController: ', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}
