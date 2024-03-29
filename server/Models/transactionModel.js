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
        location: {type: String, required: false, minlength: 0, maxlength: 200},
        exchangedRate: {type: Number, required: false},
        userPreferredCurrency: {type: String, required: true},
        recurringBill: {type: Boolean, required: true},
        timeElapsedBeforeNextPayment: {
            value: {type: String, required: false},
            unit: {type: String, required: false},
            startingDate: {type: Date, required: false},
            initialBill: {type: String, required: false}
        }
    },
    {
        timestamps: true
    }
)

const transactionModel = mongoose.model("Transaction", transactionSchema)
module.exports = transactionModel