const transactionModel = require("../Models/transactionModel")

const addTransaction = async (req, res) => {
    const { 
            userId,
            type, 
            category,
            currency,
            amount,
            paymentMethod,
            description,
            location
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
            location
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
            location
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = {
    addTransaction
}