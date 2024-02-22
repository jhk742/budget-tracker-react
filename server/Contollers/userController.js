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
    const { name, email, password, initialBalance } = req.body
    
    console.log(req.body)
    try {
        let user = await userModel.findOne({ email })
        if (user) 
            return res.status(400).json("User with the given email already exists")

        if (!name || !email || !password || !initialBalance)
            return res.status(400).json("All fields are required")

        if (!validator.isEmail(email))
            return res.status(400).json("Email must be a valid email")
        if (!validator.isStrongPassword(password))
            return res.status(400).json("Password must be a strong password")

        //all security conditions passed. Create a new isntance of the userModel to save to db
        user = new userModel({ name, email, password, initialBalance })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        await user.save()

        const token = createToken(user._id)

        //send respose to client (inform of successful creation)
        res.status(200).json({ _id: user._id, name, email, initialBalance, token })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        let user = await userModel.findOne({ email })
        if (!user) 
            return res.status(400).json("Invalid email or password")

            const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword)
            return res.status(400).json("Invalid email or password")    

        const token = createToken(user._id)

        res.status(200).json({ _id: user._id, name: user.name, email, token })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = { registerUser, loginUser }