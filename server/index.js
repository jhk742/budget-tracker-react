const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const userRoute = require("./Routes/userRoute")
const categoryRoute = require("./Routes/categoryRoute")
const transactionRoute = require("./Routes/transactionRoute")

const app = express()

require("dotenv").config()

//middleware
app.use(express.json())
app.use(cors())
app.use("/api/users", userRoute)
app.use("/api/categories", categoryRoute)
app.use("/api/transactions", transactionRoute)

const port = process.env.PORT || 5000
const uri = process.env.ATLAS_URI

app.listen(port, (req, res) => {
    console.log(`Server runnig on port: ${port}`)
})

mongoose.set('strictQuery', false)

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connection established."))
  .catch((error) => console.log("MongoDB connection failed ", error))


console.log(new Date())