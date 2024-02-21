const express = require("express")
const { addCategoryItem } = require("../Contollers/categoryController")

const router = express.Router()

router.post("/addItem", addCategoryItem)

module.exports = router