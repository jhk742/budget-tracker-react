const mongoose = require("mongoose")

const receiptSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    name: {type: String, required: true},
    data: {Buffer}
})

const receiptModel = mongoose.model("Receipt", receiptSchema)
module.exports = receiptModel