const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, minlength: 3, maxlength: 50},
        email: {type: String, required: true, minlength: 3, maxlength: 100, unique: true},
        password: {type: String, required: true, minlength: 3, maxlength: 1024},
        preferredCurrency: {type: String, required: true, minglength: 3, maxlength: 100},
        balance: {type: Number, required: true,
                            set: function(value) {
                                return Math.round(parseFloat(value) * 100) / 100
                            }
        }
    },
    {
        timestamps: true
    }
)

const userModel = mongoose.model("User", userSchema)

module.exports = userModel