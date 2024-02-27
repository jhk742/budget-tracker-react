express = require("express")
const { addTransaction, 
    convertRate, 
    getTransactions, 
    filterTransactions, 
    getTotals, 
    getCategoryExpenses
} = require("../Contollers/transactionController")

const router = express.Router()

router.post("/addTransaction", addTransaction)
router.post("/convertRate", convertRate)
router.get("/getTransactions/:userId", getTransactions)
router.get("/getFilteredTransactions/:userId/:transactionType?/:paymentMethod?/:category?/:startDate?/:endDate?", filterTransactions)
router.get("/getTotals/:userId/:category?", getTotals)
router.get("/getCategoryExpenses/:userId/:category", getCategoryExpenses)
module.exports = router
