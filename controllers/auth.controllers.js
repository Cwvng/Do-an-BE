import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import generateToken, {encodedToken} from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const {firstname, lastname, email, password, confirmPassword, gender} = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({error: "Password don't match"})
        }
        const user = await User.findOne({email})
        if (user) return res.status(400).json({error: "User existed"})


        //generate default avatar
        const malePic = `https://avatar.iran.liara.run/public/boy?username=${firstname}`
        const femalePic = `https://avatar.iran.liara.run/public/girl?username=${firstname}`

        const newUser = User({
            firstname,
            lastname,
            email,
            password,
            gender,
            profilePic: gender === 'male' ? malePic : femalePic
        })
        if (newUser) {
            //JWT token
            const token = encodedToken(newUser._id)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                profilePic: newUser.profilePic,
                password: newUser.password,
                access_token: token

            })
        } else {
            res.status(400).json({error: "Invalid user data"})
        }

    } catch (err) {
        console.log("Signup error")
        res.status(500).json({error: err.message})
    }
}
export const login = async (req, res) => {
    try {
        const {username} = req.body;
        const token = encodedToken(req.user._id)
        const user = await User.findOne({username});
        return res.status(200).json({
            user,
            access_token: token
        })

    } catch (err) {
        console.log("Login error")
        res.status(500).json({error: err.message})
    }
}
export const logout = async (req, res) => {
    try {
        res.cookie('jwt', "", {maxAge: 0});
        res.status(200).json({message: 'Logged out'})
    } catch (err) {
        console.log("Logout error")
        res.status(500).json({error: err.message})
    }
}

export const secret = async (req, res) => {
    try {

    } catch (error) {
        console.log("Secret error")
        res.status(500).json({error: error.message})
    }

}