const express = require("express")
const { addCategoryItem, retrieveCategories, updateCategory } = require("../Contollers/categoryController")

const router = express.Router()

router.post("/addItem", addCategoryItem)
router.get("/getCategories", retrieveCategories)
router.patch("/updateCategory", updateCategory)

module.exports = router