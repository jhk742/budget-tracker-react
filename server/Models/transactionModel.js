const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
    {
        userId: {type: String, required: true},
        type: {type: String, required: true, minlength: 3, maxlength: 10},
        category: {type: String, required: true, minlength: 3, maxlength: 100},
        currency: {type: String, required: true, minlength: 3, maxlength: 200},
        amount: {type: Number, required: true,
                set: function(value) {
                    return Math.round(parseFloat(value) * 100) / 100
                }
        },
        paymentMethod: {type: String, required: true, minlength: 3, maxlength: 10},
        description: {type: String, required: false, minlength: 0, maxlength: 1024},
        location: {type: String, required: false, minlength: 0, maxlength: 200}
    },
    {
        timestamps: true
    }
)

const transactionModel = mongoose.model("Transaction", transactionSchema)
module.exports = transactionModel