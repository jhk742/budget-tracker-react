import { useState, useEffect, useContext } from 'react'
import { baseUrl, getRequest, postRequest } from '../utils/services'
import { supportedCurrencies } from '../utils/currencies'
import { AuthContext } from '../context/AuthContext'

export default function RecurringBills() {
    const { user, updateUserBalance } = useContext(AuthContext)
    const [categories, setCategories] = useState([])
    const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
    const [transactionError, setTransactionError] = useState(null)
    const [transactionSuccess, setTransactionSuccess] = useState(null)
    const [transactionData, setTransactionData] = useState({
        userId: user._id,
        type: "Expense",
        category: "",
        currency: "",
        amount: "",
        paymentMethod: "Card",
        description: "",
        location: "",
        exchangedRate: "",
        userPreferredCurrency: user.preferredCurrency,
        recurringBill: true,
        timeElapsedBeforeNextPayment: {
            value: "", //integer value
            unit: "",//day, week, month, year,
            startingDate: "",
            initialBill: "" //this is the initialBill itself so this field will be an empty string
        }
    })

    // console.log(user)

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(fetchedCategories)
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const getExchangeRate = async () => {
            const exchangeRateData = {
                amount: transactionData.amount,
                preferredCurrency: user.preferredCurrency.substring(0, 3),
                providedCurrency: transactionData.currency.substring(0, 3)
            }
            try {
                if ((transactionData.amount && transactionData.currency) && user.preferredCurrency !== transactionData.currency) {
                    const res = await postRequest(`${baseUrl}/transactions/convertRate`, JSON.stringify(exchangeRateData))
                    setTransactionData((prev) => ({
                        ...prev,
                        exchangedRate: res.exchangedRate
                    }))
                } 
            } catch (error) {
                console.error(error)
                return new Error(`Error fetching exchange rate: ${error.message}`) // Return null or handle the error condition
            }
        }
        getExchangeRate()
    }, [transactionData.currency, transactionData.amount])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === "unit" || name === "value" || name === "startingDate") {
            setTransactionData((prev) => ({
                ...prev,
                timeElapsedBeforeNextPayment: {
                    ...prev.timeElapsedBeforeNextPayment,
                    [name]: value
                }
            }))
        } else {
            setTransactionData((prev) => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const compareDate = (providedDate, option) => {
        const today = new Date()
        switch (option) {
            case "lessThan":
                if (providedDate.getFullYear() < today.getFullYear()) {
                    return true
                }
                if (providedDate.getFullYear() === today.getFullYear() && providedDate.getMonth() < today.getMonth()) {
                    return true
                }
                if (providedDate.getFullYear() === today.getFullYear() && providedDate.getMonth() === today.getMonth()) {
                    return providedDate.getDate() < today.getDate()
                }
                break
            case "same":
                return (providedDate.getDate() === today.getDate() && providedDate.getMonth() === today.getMonth() && providedDate.getFullYear() === today.getFullYear())
        }
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault()
        setIsCreatingTransaction(true)
        setTransactionError(null)
        let newAmount = transactionData.exchangedRate ? transactionData.exchangedRate : transactionData.amount

        try {
            if (!transactionData.category || !transactionData.currency || !transactionData.amount || !transactionData.timeElapsedBeforeNextPayment.value || !transactionData.timeElapsedBeforeNextPayment.unit || !transactionData.timeElapsedBeforeNextPayment.startingDate) {
                return setTransactionError({ message: "Please provide input for the following fields: 'Category', 'Currency', 'Amount', 'Interval', 'Unit', 'Starting Date'"})
            }

            if (transactionData.amount < 0) {
                return setTransactionError({ message: "You have entered an invalid amount" })
            }
            
            if (user.balance - newAmount < 0) {
                return setTransactionError({ message: "The amount you've entered exceeds your current balance" })
            }

            // if (compareDate(new Date(transactionData.timeElapsedBeforeNextPayment.startingDate), "lessThan")) {
            //     return setTransactionError({ message: `The starting date of a recurring bill must either be the current date, ${new Date().toLocaleDateString(undefined, {
            //         day: 'numeric', month: 'numeric', year: 'numeric'
            //     })}, or greater` })
            // }

            setTransactionData((prev) => ({
                ...prev,
                timeElapsedBeforeNextPayment: {
                    ...prev.timeElapsedBeforeNextPayment,
                    startingDate: new Date(prev.timeElapsedBeforeNextPayment.startingDate)
                }
            }))

            const res = await postRequest(`${baseUrl}/transactions/addTransaction`, JSON.stringify(transactionData))

            if (res.error) {
                return setTransactionError(res)
            }

            //if startingDate === today, updateUserBalance
            if (compareDate(new Date(transactionData.timeElapsedBeforeNextPayment.startingDate), "same")) {
                updateUserBalance(user.balance - newAmount)
            }

            setTransactionSuccess("Transaction created successfully!")

        } catch (error) {
            console.error("Error creating transaction", error)
            setTransactionError(error.message)
        } finally {
            setIsCreatingTransaction(false)
        }
    }

    const handleReset = (e) => {
        e.preventDefault()
        setTransactionData((prev) => ({
            ...prev,
            category: "",
            currency: "",
            amount: "",
            description: "",
            location: "",
            exchangedRate: "",
            timeElapsedBeforeNextPayment: {
                value: "",
                unit: "",
                startingDate: ""
            }
        }))
        setTransactionSuccess(null)
        setTransactionError(null)
    }

    const categoriesList = categories.map((category, index) => {
        return (
            <option
                key={index}
                value={`${category.name}`}
            >
                {category.name}
            </option>
        )
    })

    const currenciesList = supportedCurrencies.map((currency, index) => {
        const { code, name } = currency        
        return (
            <option
                key={index}
                value={`${code} - ${name}`}
            >{`${code} - ${name}`}</option>
        )
    })

    return (
        <div className="RecurringBills">
            <h1>Recurring Bills</h1>
            <form
                className="recurring-bills-form"
                onSubmit={handleOnSubmit}
            >
                <div className="recurring-bills-input">
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        name="category"
                        value={transactionData.category}
                        onChange={handleInputChange}
                    >
                        <option value="">--- Select Category ---</option>
                        {categoriesList}
                    </select>
                </div>

                <div className="recurring-bills-input">
                    <label htmlFor="currency">Currency:</label>
                    <select
                        id="currency"
                        name="currency"
                        value={transactionData.currency}
                        onChange={handleInputChange}
                    >
                        <option value="">--- Select Currency ---</option>
                        {currenciesList}
                    </select>
                </div>

                <div className="recurring-bills-input">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={transactionData.amount}
                        onChange={handleInputChange}
                    ></input>
                </div>
                <div className="recurring-bills-input">
                    <label>{`Converted Rate (amount to be added to / deducted from your balance):`}</label>
                    <textarea
                        readOnly
                        value={transactionData.exchangedRate !== "" ? `(${transactionData.currency.substring(0, 3)}) -> (${user.preferredCurrency.substring(0, 3)}) = ${transactionData.amount} -> ${transactionData.exchangedRate} (this value will be added/deducted)` : ""}
                    >
                    </textarea>
                </div>
                <div className="recurring-bills-input">
                    <label htmlFor="description">Description:</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={transactionData.description}
                        onChange={handleInputChange}
                    ></input>
                </div>
                <div className="recurring-bills-input">
                    <label htmlFor="location">Location:</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={transactionData.location}
                        onChange={handleInputChange}
                    ></input>
                </div>
                <div className="recurring-bills-input">
                    <div>
                        <label htmlFor="value">Interval (Interger Value):</label>
                        <input
                            type="number"
                            id="value"
                            name="value"
                            value={transactionData.timeElapsedBeforeNextPayment.value}
                            onChange={handleInputChange}
                        ></input>
                    </div>
                    <div>
                        <label htmlFor="unit">Unit:</label>
                        <select
                            id="unit"
                            name="unit"
                            value={transactionData.timeElapsedBeforeNextPayment.unit}
                            onChange={handleInputChange}
                        >
                            <option value="">--- Select Interval Unit ---</option>
                            <option value="Day">Day(s)</option>
                            <option value="Week">Week(s)</option>
                            <option value="Month">Month(s)</option>
                            <option value="Year">Year(s)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="datePicker">Starting Date:</label>
                        <input
                            type="text"
                            id="datePicker"
                            name="startingDate"
                            value={transactionData.timeElapsedBeforeNextPayment.startingDate}
                            placeholder='dd-mm-yyyy'
                            onChange={handleInputChange}
                        ></input>
                    </div>
                </div>
                <div className="recurring-bills-buttons">
                    <button
                        type="submit"
                    >{isCreatingTransaction ? "Creating Transaction..." : "Create Bill"}</button>
                    <button
                        onClick={handleReset}
                    >Reset Form</button>
                </div>
            </form>
            <div className="recurring-bill-message-box">
                {transactionSuccess && 
                    (
                        <div className="recurring-bill-success-message">
                            <span>Transaction Created Successfully</span>
                            <button
                                onClick={handleReset}
                            >X</button>
                        </div>
                    )
                }
            </div>
            <div className="recurring-bill-message-box">
                {transactionError && 
                    (
                        <div className="recurring-bill-error-message">
                            <span>{transactionError.message}</span>
                            <button
                                onClick={handleReset}
                            >X</button>
                        </div>
                    )
                }
            </div>
        </div>
    )
}