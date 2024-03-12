express = require("express")
const { addTransaction, 
    convertRate, 
    getTransactions, 
    filterTransactions, 
    getTotals, 
    getCategoryExpenses,
    payRecurringBills,
    getRecurringBills
} = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)
router.get("/getTransactions/:userId", getTransactions)
router.get("/getFilteredTransactions/:userId/:transactionType?/:paymentMethod?/:category?/:startDate?/:endDate?", filterTransactions)
router.get("/getTotals/:userId/:category?", getTotals)
router.get("/getCategoryExpenses/:userId/:category", getCategoryExpenses)
router.get("/payRecurringBills/:userId", payRecurringBills)
router.get("/getRecurringBills/:userId", getRecurringBills)
module.exports = router
