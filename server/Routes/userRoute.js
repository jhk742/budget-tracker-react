const express = require("express")
const { registerUser, loginUser } = require("../Contollers/userController")

const router = express.Router()

//routes
router.post("/register", registerUser)
router.post("/login", loginUser)

module.exports = router