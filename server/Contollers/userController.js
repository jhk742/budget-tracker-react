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
    const { name, email, password, preferredCurrency, balance } = req.body
    try {
        let user = await userModel.findOne({ email })
        if (user) 
            return res.status(400).json("User with the given email already exists")

        if (!name || !email || !password || !balance || !preferredCurrency)
            return res.status(400).json("All fields are required")

        if (!validator.isEmail(email))
            return res.status(400).json("Email must be a valid email")
        if (!validator.isStrongPassword(password))
            return res.status(400).json("Password must be a strong password")

        //all security conditions passed. Create a new isntance of the userModel to save to db
        user = new userModel({ name, email, password, preferredCurrency, balance })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        await user.save()

        const token = createToken(user._id)

        //send respose to client (inform of successful creation)
        res.status(200).json({ _id: user._id, name, email, preferredCurrency, balance, token })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const updateUserBalance = async (req, res) => {
    const { userId } = req.params
    const updatedUserData = req.body
    try {
        const user = await userModel.findByIdAndUpdate(userId, { balance: updatedUserData.balance }, { new: true })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ message: 'User balance updated successfully', user })

    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({ message: `Internal server error: ${error.message}` })
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

        res.status(200).json({ _id: user._id, name: user.name, email, preferredCurrency: user.preferredCurrency, balance: user.balance, token })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = { registerUser, loginUser, updateUserBalance }