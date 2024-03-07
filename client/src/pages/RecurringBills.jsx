import { useState, useEffect, useContext } from 'react'
import { baseUrl, getRequest, postRequest } from '../utils/services'
import { supportedCurrencies } from '../utils/currencies'
import { AuthContext } from '../context/AuthContext'

export default function RecurringBills() {
    const { user } = useContext(AuthContext)
    const [categories, setCategories] = useState([])
    const [transactionData, setTransactionData] = useState({
        userId: user._id,
        category: "",
        currency: "",
        amount: "",
        paymentMethod: "Card",
        description: "",
        location: "",
        exchangedRate: "",
        userPreferredCurrency: user.preferredCurrency,
        timeElapsedBeforeNextPayment: {
            value: "", //integer value
            unit: ""//day, week, month, year
        }
    })

    console.log(transactionData)

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
        if (name === "unit" || name === "value") {
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
                </div>
                <div className="recurring-bills-buttons">
                    <button
                        type="submit"
                    >Create Bill</button>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            setTransactionData((prev) => ({
                                ...prev,
                                category: "",
                                currency: "",
                                amount: "",
                                paymentMethod: "",
                                description: "",
                                location: "",
                                exchangedRate: "",
                                timeElapsedBeforeNextPayment: {
                                    value: "",
                                    unit: ""
                                }
                            }))
                        }}
                    >Reset Form</button>
                </div>
            </form>
            
        </div>
    )
}