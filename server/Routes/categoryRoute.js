const express = require("express")
const { addCategoryItem, retrieveCategories, updateCategory, deleteCategory } = require("../Contollers/categoryController")

const router = express.Router()

router.post("/addItem", addCategoryItem)
router.get("/getCategories", retrieveCategories)
router.patch("/updateCategory", updateCategory)
router.delete("/deleteCategory/:_id/:name", deleteCategory)

module.exports = router