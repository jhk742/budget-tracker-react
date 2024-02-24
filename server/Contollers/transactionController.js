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

const filterTransactions = async (req, res) => {
    const { userId, date, transactionType, paymentMethod } = req.params
    try {
        
        const sanitizedDate = date === "null" ? "" : date
        const sanitizedTransactionType = transactionType === "null" ? "" : transactionType;
        const sanitizedPaymentMethod = paymentMethod === "null" ? "" : paymentMethod;


        let query = { userId }

        //needs more work
        if (sanitizedDate) {
            query.createdAt = sanitizedDate
        }

        if (sanitizedTransactionType) {
            query.type = sanitizedTransactionType.charAt(0).toUpperCase() + sanitizedTransactionType.slice(1)
        }

        if (sanitizedPaymentMethod) {
            query.paymentMethod = sanitizedPaymentMethod.charAt(0).toUpperCase() + sanitizedPaymentMethod.slice(1)
        }

        const response = await transactionModel.find(query)
        res.status(200).json({
            transactions: response
        })
    } catch (error) {
        console.error("Error fetching transactions: ", error)
        res.status(500).json({ message: `Internal server error ${userId} ${date} ${transactionType} ${paymentMethod}` })
    }
}

module.exports = {
    addTransaction,
    convertRate,
    getTransactions,
    filterTransactions
}