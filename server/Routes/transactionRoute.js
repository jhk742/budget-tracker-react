express = require("express")
const { addTransaction, convertRate, getTransactions, filterTransactions } = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)
router.get("/getTransactions/:userId", getTransactions)
router.get("/getFilteredTransactions/:userId/:transactionType?/:paymentMethod?/:date?", filterTransactions)
module.exports = router
