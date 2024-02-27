express = require("express")
const { uploadReceipt } = require("../Contollers/receiptController")

const router = express.Router()

router.post("/uploadReceipt", uploadReceipt)