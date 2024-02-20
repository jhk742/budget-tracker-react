const express = require("express")
const { registerUser } = require("../Contollers/userController")

const router = express.Router()

//routes
router.post("/register", registerUser)

module.exports = router