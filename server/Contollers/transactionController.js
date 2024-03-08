const axios = require("axios")
const transactionModel = require("../Models/transactionModel")
const dotenv = require("dotenv")
dotenv.config()

const addTransaction = async (req, res) => {
    const { 
            userId,
            type, 
            category,
            currency,
            amount,
            paymentMethod,
            description,
            location,
            exchangedRate,
            userPreferredCurrency,
            recurringBill,
            timeElapsedBeforeNextPayment
    } = req.body

    try {
        if (!type || !category || !currency || !amount || !paymentMethod)
            return res.status(400).json("The following fields must be provided: type, category, currency, amount, payment method")

        let transaction = new transactionModel({ 
            userId,
            type,
            category,
            currency,
            amount,
            paymentMethod,
            description,
            location,
            exchangedRate,
            userPreferredCurrency,
            recurringBill,
            timeElapsedBeforeNextPayment
        })
        await transaction.save()

        res.status(200).json({
            _id: transaction._id,
            userId,
            type,
            category,
            currency,
            amount,
            paymentMethod,
            description,
            location,
            exchangedRate,
            userPreferredCurrency,
            recurringBill,
            timeElapsedBeforeNextPayment
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const convertRate = async (req, res) => {
    const { amount, preferredCurrency, providedCurrency } = req.body

    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${providedCurrency}/${preferredCurrency}/${amount}`
    try {
        const response = await axios.get(url)
        const exchangedRate = response.data.conversion_result
        res.status(200).json({ exchangedRate })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: `Having trouble making the API call to exchange-rate` })
    }
}

const getTransactions = async (req, res) => {
    const { userId } = req.params
    try {
        const response = await transactionModel.find({ userId: userId })
    
        if (response.length === 0)
            return res.status(404).json({ message: "Could not find data" })

        res.status(200).json({
            transactions: response
        })
    } catch (error) {
        console.error("Error fetching transactions: ", error)
        res.status(500).json({ message: "Internal server error." })
    }
}

const formatDate = (dateString) => {
    const [month, day, year] = dateString.split("-")
    return `${year}-${month}-${day}`
}

const filterTransactions = async (req, res) => {
    const { userId, startDate, endDate, transactionType, paymentMethod, category } = req.params
    try {
        const sanitizedStartDate = startDate === "null" ? "" : formatDate(startDate)
        const sanitizedEndDate = endDate === "null" ? "" : formatDate(endDate)
        const sanitizedTransactionType = transactionType === "null" ? "" : transactionType
        const sanitizedPaymentMethod = paymentMethod === "null" ? "" : paymentMethod
        const sanitizedCategory = category === "null" ? "" : category

        let query = { userId }

        if (sanitizedStartDate && sanitizedEndDate) {
            query.$expr = {
                $and: [
                    {
                        $gte: [{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }}, sanitizedStartDate]
                    },
                    {
                        $lte: [{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }}, sanitizedEndDate]
                    }
                ]
            }
        }

        if (sanitizedTransactionType) {
            query.type = sanitizedTransactionType.charAt(0).toUpperCase() + sanitizedTransactionType.slice(1)
        }

        if (sanitizedPaymentMethod) {
            query.paymentMethod = sanitizedPaymentMethod.charAt(0).toUpperCase() + sanitizedPaymentMethod.slice(1)
        }

        if (sanitizedCategory) {
            query.category = sanitizedCategory
        }

        const response = await transactionModel.find(query)

        if (response.length === 0)
            return res.status(404).json({ message: "Could not find data" })

        res.status(200).json({
            transactions: response
        })
    } catch (error) {
        console.error("Error fetching transactions: ", error)
        res.status(500).json({ message: `Internal server error` })
    }
}

const getTotals = async (req, res) => {
    const { userId, category } = req.params
    let query = { userId }
    const sanitizedCategory = category === "null" ? "" : category

    if (sanitizedCategory) {
        query.category = sanitizedCategory
    }

    try {
        const response = await transactionModel.find(query)

        if (response.length === 0)
            return res.status(404).json({ message: "Could not find data" })
        
        const incomes = response.filter(transaction => transaction.type === "Income")
        const expenses = response.filter(transaction => transaction.type === "Expense")
        
        //total income displayed in preferred currency
        const totalIncomePreferredCurrency = incomes.reduce((total, income) => total + (income?.exchangedRate || income.amount), 0)
        
        //total expenditure displayed in preferred currency
        const totalExpensePreferredCurrency = expenses.reduce((total, expense) => total + (expense.currency === expense.userPreferredCurrency ? expense.amount : expense?.exchangedRate), 0)

        //total income from preferred currency
        const incomePreferredCurrency = incomes.filter(transaction => {
            return transaction.currency === transaction.userPreferredCurrency
        })
        .reduce((total, income) => total + income.amount, 0)

        //total expenditure of preferred currency
        const expensePreferredCurrency = expenses.filter(transaction => {
            return transaction.currency === transaction.userPreferredCurrency
        })
        .reduce((total, expense) => total + expense.amount, 0)

        const baseCurrencies = Array.from(
            new Set(
                response
                .filter(transaction => transaction.currency !== transaction.userPreferredCurrency)
                .map(transaction => transaction.currency)
            )
        )

        const alternativeCurrenciesIncome = baseCurrencies.map(currency => {
            // Calculate the total base amount
            const baseTotal = incomes.filter(transaction => transaction.currency === currency)
                                     .reduce((total, income) => total + income.amount, 0)
        
            // Calculate the total exchanged amount using exchangedRate
            const exchangedTotal = incomes.filter(transaction => transaction.currency === currency)
                                          .reduce((total, income) => total + income.exchangedRate, 0)
        
            // Return an object representing the currency data
            return {
                currency,
                baseTotal,
                exchangedTotal
            }
        })

        const alternativeCurrenciesExpenses = baseCurrencies.map(currency => {
            // Calculate the total base amount
            const baseTotal = expenses.filter(transaction => transaction.currency === currency)
                                     .reduce((total, income) => total + income.amount, 0)
        
            // Calculate the total exchanged amount using exchangedRate
            const exchangedTotal = expenses.filter(transaction => transaction.currency === currency)
                                          .reduce((total, income) => total + income.exchangedRate, 0)
        
            // Return an object representing the currency data
            return {
                currency,
                baseTotal,
                exchangedTotal
            }
        })

        const alternativeCurrenciesTotalIncome = alternativeCurrenciesIncome.reduce((total, currencyTotal) => total + currencyTotal.exchangedTotal, 0)
        const alternativeCurrenciesTotalExpense = alternativeCurrenciesExpenses.reduce((total, currencyTotal) => total + currencyTotal.exchangedTotal, 0)

        res.status(200).json({
            totalIncomePreferredCurrency,
            totalExpensePreferredCurrency,
            alternativeCurrenciesIncome,
            alternativeCurrenciesExpenses,
            incomePreferredCurrency,
            expensePreferredCurrency,
            alternativeCurrenciesTotalIncome,
            alternativeCurrenciesTotalExpense
        })
    } catch (error) {
        console.error("Error fetching transactions: ", error)
        res.status(500).json({ message: `Internal server error: ${error} `})
    }
}

const getCategoryExpenses = async (req, res) => {
    const { userId, category } = req.params
    let query = { userId, category }
    try {
        const response = await transactionModel.find(query)
        
        if (response.length === 0)
            return res.status(200).json({ message: "No data found for the specified category" });        
        
        const expenses = response.filter(transaction => transaction.type === "Expense")
        const total = expenses.reduce((total, expense) => {
            return total += expense.currency === expense.userPreferredCurrency ? expense.amount : expense.exchangedRate
        }, 0)
        const preferredCurrencyTotal = expenses.reduce((total, expense) => {
            return total += expense.currency === expense.userPreferredCurrency ? expense.amount : 0
        }, 0)

        const alternativeCurrencies = Array.from(
            new Set(
                expenses
                    .filter(transaction => transaction.currency !== transaction.userPreferredCurrency)
                    .map(transaction => transaction.currency)
            )
        )

        const alternativeCurrenciesTotalExpense = alternativeCurrencies.map(currency => {
            const baseTotal = expenses
                                .filter(transaction => transaction.currency === currency)
                                .reduce((total, expense) => {
                                    return total + expense.amount
                                }, 0)

            const exchangedTotal = expenses
                                .filter(transaction => transaction.currency === currency)
                                .reduce((total, expense) => {
                                    return total + expense.exchangedRate
                                },0)
            return {
                currency,
                baseTotal,
                exchangedTotal
            }
        })

        res.status(200).json({
            total,
            preferredCurrencyTotal,
            alternativeCurrenciesTotalExpense
        })
    } catch (error) {
        console.error("Error fetching transactions:", error)
        res.status(500).json({ message: `Internal server error: ${error}`})
    }
}

const payRecurringBills = async (req, res) => {
    const { userId } = req.params
    try {
        const response = await transactionModel.find({ userId, recurringBill: true })
        if (response.length === 0) {
            return res.status(200).json({ message: "No data found" })
        }

        /**
         * go through the transactions and first 
         * 
         * (first check to see if the transaction we're dealing with was the 
         * initial payment or NOT)
         * 
         * IF SO, create a new bill with the 'initialBill' field initialized 
         * to the _id of its corresponding initial bill
         * 
         * IF NOT, invoke mostRecentRecurringBills method implemented below
            create a list for each recurringBill (using the initialBill field)
         * and retrieve the one with the most recent date (this is the bill that would need to be paid)
         * 
         * calculate the
         * day when the next payment should be made...
         * then, if the target payment date === today, make the payment
         * and update user balance
         * 
         * make sure that no duplicate payments are made... (make sure the payment is
         * made only ONCE)
         */

        /**
         * 1) Get all INITIAL BILLS for which a new payment must be made
         * => CREATION OF THE SECOND BILL
         */
        const initialBills = [];

        for (const transaction of response) {
            const hasAssociatedBills = await transactionModel.exists({
                userId,
                "timeElapsedBeforeNextPayment.initialBill": transaction._id
            });
        
            // Check if the initialBill is not present or an empty string and has no associated bills
            if ((!transaction.timeElapsedBeforeNextPayment.initialBill || transaction.timeElapsedBeforeNextPayment.initialBill === "") && !hasAssociatedBills) {
                initialBills.push(transaction);
            }
        }
        /**
         * 2) Iterate through each transaction and for each, find the one with the most
         * recent "startingDate" within its associated recurring bills
         * => ALL BILLS THAT ARE NOT THE INITIAL NOR SECOND BILL
         */
        const mostRecentRecurringBills = (await Promise.all(response.map(async transaction => {
            const mostRecentRecurringBill = await transactionModel.find({
                'timeElapsedBeforeNextPayment.initialBill': transaction._id
            }).sort({ 'timeElapsedBeforeNextPayment.startingDate': -1 }).limit(1)

            return mostRecentRecurringBill
        }))).filter(bill => bill.length > 0).flat()

        //previousBillId AND intialBill should both be fields

        const allBills = [...initialBills, ...mostRecentRecurringBills]

        const time = new Date(allBills[0].timeElapsedBeforeNextPayment.startingDate).toLocaleDateString('en-us')
        const today = new Date().toLocaleDateString('en-us')

        const billsToPay = allBills.map((transaction) => {
            let days = 0
            const { value, startingDate, unit } = transaction.timeElapsedBeforeNextPayment

            switch (unit) {
                case "Day":
                    days = value
                    break
                
                case "Week":
                    days = 7 * value
                    break

                case "Month":
                    days = 30 * value
                    break
                
                case "Year":
                    days = 365 * value
            }

            const targetDate = new Date(startingDate)
            targetDate.setDate(targetDate.getDate() + days)

            //if the targetDate === today, create a transaction and update user balance
            if (new Date() === targetDate) {
                
            }

            return {
                id: transaction._id,
                startingDate,
                targetDate,
                value,
                unit
            }
        })

        //before making the payment, make sure to check if the bill has already been paid...
        //unless the logic provided above already does that for us...

        const recurringBills = response.map((transaction) => {
            const bills = {
                userId,
                type: "Expense",
                category: transaction.category,
                currency: transaction.currency,
                amount: transaction.amount,
                paymentMethod: "Card",
                description: transaction.description,
                location: transaction.location,
                exchangedRate: transaction?.exchangedRate ?? null,
                recurringBill: true,
                timeElapsedBeforeNextPayment: {
                    value: transaction.timeElapsedBeforeNextPayment.value,
                    unit: transaction.timeElapsedBeforeNextPayment.unit,
                    startingDate: new Date(),//today's date,
                    intitialBill: transaction.timeElapsedBeforeNextPayment.initialBill ? transaction.timeElapsedBeforeNextPayment.initialBill : transaction._id
                    //if initialBill field is not empty, use that, if not, this is the second payment
                }
            }
        })

        //make necessary payments and then updateUserBalance accordingly


        // res.status(200).json({
        //     transactions: response
        // })
        res.status(200).json({
            initialBills,
            mostRecentBills: mostRecentRecurringBills,
            allBills,
            time,
            today,
            billsToPay
        })
    } catch (error) {

    }

}

module.exports = {
    addTransaction,
    convertRate,
    getTransactions,
    filterTransactions,
    getTotals,
    getCategoryExpenses,
    payRecurringBills
}