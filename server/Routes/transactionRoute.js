express = require("express")
const { addTransaction, 
    convertRate, 
    getTransactions, 
    filterTransactions, 
    getTotals, 
    getCategoryExpenses,
    payRecurringBills
} = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)
router.get("/getTransactions/:userId", getTransactions)
router.get("/getFilteredTransactions/:userId/:transactionType?/:paymentMethod?/:category?/:startDate?/:endDate?", filterTransactions)
router.get("/getTotals/:userId/:category?", getTotals)
router.get("/getCategoryExpenses/:userId/:category", getCategoryExpenses)
router.get("/getRecurringBills/:userId", payRecurringBills)
module.exports = router
