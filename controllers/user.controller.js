import User from "../models/user.model.js";

export const getAllOtherUsers= async (req, res)=>{
    try {
        const loggedUserId = req.user._id;
        const allUsers = await User.find({_id:{$ne:loggedUserId}})

        res.status(200).json(allUsers)
    }catch (err){
        console.log("Error in userController: ", err.message);
        res.status(500).json({error: "Internal server error"})
    }
}