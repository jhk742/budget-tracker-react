express = require("express")
const { addTransaction, convertRate, getTransactions, filterTransactions, getTotals } = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)
router.get("/getTransactions/:userId", getTransactions)
router.get("/getFilteredTransactions/:userId/:transactionType?/:paymentMethod?/:category?/:startDate?/:endDate?", filterTransactions)
router.get("/getTotals/:userId/:category?", getTotals)
module.exports = router
