const axios = require("axios")
const transactionModel = require("../Models/transactionModel")
const dotenv = require("dotenv")
const userModel = require("../Models/userModel")
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

        //concatenate the two arrays into one array
        const allBills = [...initialBills, ...mostRecentRecurringBills]

        //used to check if today is the bills' timeElapsedBeforeNextPayment.staringDate
        const today = new Date().toLocaleDateString('en-us')

        /**
         * Iterate through each bill/transaction and read the value of
         * unit, value, and startingDate. If the startingDate + value calculated 
         * from the given "value" and "unit" is equivalent to today's date, create a transaction
         */
        const billsToPay = allBills.map((transaction) => {
            let days = 0
            const { value, startingDate, unit } = transaction.timeElapsedBeforeNextPayment

            switch (unit) {
                case "Day":
                    days = Number(value)
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

            
            let targetDate = new Date(startingDate)
            targetDate.setDate(targetDate.getDate() + days)
            targetDate = targetDate.toLocaleDateString('en-us')

            //if the targetDate === today, create a transaction and update user balance
            if (today === targetDate) {
                /**
                 * make payment based off userPreferredCurrency / alternative currency 
                 * provided
                 */
                let newTransactionData = {
                    userId: transaction.userId,
                    type: "Expense",
                    category: transaction.category,
                    currency: transaction.currency,
                    amount: transaction.amount,
                    paymentMethod: "Card",
                    description: transaction.description,
                    location: transaction.location,
                    exchangedRate: transaction?.exchangedRate ?? null,
                    userPreferredCurrency: transaction.userPreferredCurrency,
                    recurringBill: true,
                    timeElapsedBeforeNextPayment: {
                        value: transaction.timeElapsedBeforeNextPayment.value,
                        unit: transaction.timeElapsedBeforeNextPayment.unit,
                        startingDate: new Date(), //today's date
                        initialBill: transaction.timeElapsedBeforeNextPayment.initialBill 
                            ? transaction.timeElapsedBeforeNextPayment.initialBill
                            : transaction._id
                        /*
                        if initialBill field is not empty, use that, if not, 
                        this is the second payment for the bill
                        */
                    }
                }

                return newTransactionData
                
            }
        }).filter(bill => bill)

        //iterate through the billsToPay array to create transactions and make deductions
        //before making the payment, make sure to check if the bill has already been paid...
        //unless the logic provided above already does that for us...

        //make necessary payments and then updateUserBalance accordingly
        for (const bill of billsToPay) {
            try {
                let newTransaction = new transactionModel(bill)
                await newTransaction.save()
                const user = await userModel.findById(bill.userId)
                user.balance -= bill.exchangedRate ? bill.exchangedRate : bill.amount
                await user.save()
            } catch (error) {
                res.status(500).json(error)
            }
        }

        res.status(200).json({
            initialBills,
            mostRecentBills: mostRecentRecurringBills,
            allBills,
            today,
            billsToPay
        })
    } catch (error) {
        console.error("Error fetching transactions:", error)
        res.status(500).json(error)
    }
}

const getRecurringBills = async (req, res) => {
    const { userId } = req.params
    try {
        const response = await transactionModel.find({ userId })

        const initialBills = response.filter(transaction => transaction.timeElapsedBeforeNextPayment.initialBill === "")

        //for some reason, the code below is not returning the proper results
        const associatedBills = initialBills.map((transaction) => {
            return response.filter(tx => tx.timeElapsedBeforeNextPayment.initialBill === String(transaction._id))
        })
        
        res.status(200).json({ response, initialBills, associatedBills })
    } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).json(error)
    }
}

module.exports = {
    addTransaction,
    convertRate,
    getTransactions,
    filterTransactions,
    getTotals,
    getCategoryExpenses,
    payRecurringBills,
    getRecurringBills
}