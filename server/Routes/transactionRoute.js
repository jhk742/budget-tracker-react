express = require("express")
const { addTransaction } = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)

module.exports = router