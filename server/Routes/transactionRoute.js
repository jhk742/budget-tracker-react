express = require("express")
const { addTransaction, convertRate } = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)

module.exports = router