const receiptModel = require("../Models/receiptModel")

const uploadReceipt = async (req, res) => {
    const {
        userId,
        name,
        data
    } = req.body

    try {
        if (!userId || !name || !data)
            return res.status(400).json("All fields are required")

            let receipt = new receiptModel({
                userId,
                name,
                data,
            })

            await receipt.save()
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = {
    uploadReceipt
}