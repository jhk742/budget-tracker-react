const express = require("express")
const { addCategoryItem, retrieveCategories } = require("../Contollers/categoryController")

const router = express.Router()

router.post("/addItem", addCategoryItem)
router.get("/getCategories", retrieveCategories)

module.exports = router