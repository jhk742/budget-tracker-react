const userModel = require("../Models/userModel")
const bcrypt = require("bcrypt")
const validator = require("validator")
const jwt = require("jsonwebtoken")

const createToken = (_id) => {
    const jwtKey = process.env.JWT_SECRET_KEY
    return jwt.sign({_id}, jwtKey, {expiresIn: "3d"})
}

//to register a user
const registerUser = async (req, res) => {
    try {
        const { name, email, password} = req.body
        let user = await userModel.findOneAndDelete({ email })
        if (user) 
            return res.status(400).json("User with the given email already exists.")

        if (!name || !email || !password)
            return res.status(400).json("All fields are required.")

        if (!validator.isEmail(email))
            return res.status(400).json("Email must be a valid email.")
        if (!validator.isStrongPassword(password))
            return res.status(400).json("Password must be a strong password.")

        //all security conditions passed. Create a new isntance of the userModel to save to db
        user = new userModel({ name, email, password })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        await user.save()

        const token = createToken(user._id)

        //send respose to client (inform of successful creation)
        res.status(200).json({ _id: user._id, name, email, token })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = { registerUser }