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
            userPreferredCurrency
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
            userPreferredCurrency
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
            userPreferredCurrency
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
            return res.status(200).json({ message: "No data found with the specified category" });        
        
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

module.exports = {
    addTransaction,
    convertRate,
    getTransactions,
    filterTransactions,
    getTotals,
    getCategoryExpenses
}