const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
    {
        name: {type: String, required: true, minglength: 3, maxlength: 50},
        description: {type: String, required: true, minglength: 3, maxlength: 1024}
    }
)

const categoryModel = mongoose.model("Category", categorySchema)

module.exports = categoryModel