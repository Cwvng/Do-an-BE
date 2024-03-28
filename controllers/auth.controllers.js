import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const {firstname,lastname, email, password, confirmPassword, gender} = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({error: "Password don't match"})
        }
        const user = await User.findOne({email})
        if (user) return res.status(400).json({error: "User existed"})

        //HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        //
        const malePic = `https://avatar.iran.liara.run/public/boy?username=${firstname}`
        const femalePic = `https://avatar.iran.liara.run/public/girl?username=${firstname}`

        const newUser = User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            gender,
            profilePic: gender === 'male' ? malePic : femalePic
        })
        if (newUser) {
            //JWT token
            await generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                firstname: newUser.firstname,
                lastname:newUser.lastname,
                email: newUser.email,
                profilePic: newUser.profilePic
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
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
            res.status(400).json({error: 'Invalid username or password'});
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            userName: user.username,
            profilePic: user.profilePic
        })
    } catch (err) {
        console.log("Login error")
        res.status(500).json({error: err.message})
    }
}
export const logout = async (req, res) => {
    try{
        res.cookie('jwt',"",{maxAge:0});
        res.status(200).json({message:'Logged out'})
    }catch (err) {
        console.log("Logout error")
        res.status(500).json({error: err.message})
    }
}

export const secret =  (req, res)=>{

}