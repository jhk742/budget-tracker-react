const categoryModel = require("../Models/categoryModel")

const addCategoryItem = async (req, res) => {
    const { name, description } = req.body
    try {
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

const updateCategory = async (req, res) => {
    const { _id, name, description } = req.body
    try {
        const category = await categoryModel.findById(_id)

        if (!category) 
            return res.status(404).json({ message: `Category: ${name} not found`})
    
        //if found, update the name and desc
        category.name = name
        category.description = description

        //and save
        await category.save()

        res.status(200).json({
            message: `Category ${name} updated successfully`,
            _id,
            name,
            description
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = { 
    addCategoryItem, 
    retrieveCategories,
    updateCategory
}