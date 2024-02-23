express = require("express")
const { addTransaction, convertRate, getTransactions } = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)
router.get("/getTransactions/:userId", getTransactions)

module.exports = router
