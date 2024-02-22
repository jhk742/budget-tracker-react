const express = require("express")
const { registerUser, loginUser, updateUserBalance } = require("../Contollers/userController")

const router = express.Router()

//routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.patch("/updateUserBalance/:userId", updateUserBalance)

module.exports = router
