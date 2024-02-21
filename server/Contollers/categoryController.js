const categoryModel = require("../Models/categoryModel")

const addCategoryItem = async (req, res) => {
    try {
        const { name, description } = req.body
        let item = await categoryModel.findOne({ name })
        if (item) 
            return res.status(400).json("Category with the given name already exists")
        if (!name || !description)
            return res.status(400).json("All fields are required")

            item = new categoryModel({ name, description })
            await item.save()

            res.status(200).json({ _id: item._id, name, description })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const retrieveCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find()
        res.status(200).json(categories)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error. Could not retrieve categories." })
    }
}

module.exports = { addCategoryItem, retrieveCategories }