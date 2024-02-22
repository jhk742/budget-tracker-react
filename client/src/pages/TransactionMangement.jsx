import { useState, useEffect, useContext } from 'react'
import { baseUrl, postRequest, getRequest } from '../utils/services'
import { supportedCurrencies } from '../utils/currencies'
import { AuthContext } from '../context/AuthContext'

export default function TransactionManagement() {

    const { user } = useContext(AuthContext)

    const [categories, setCategories] = useState([])

    const [isCreatingTransactionLoading, setIsCreatingTransactionLoading] = useState(false)
    const [transactionError, setTransactionError] = useState(null)
    const [transactionData, setTransactionData] = useState({
        userId: user._id,
        type: "", //expense/income
        category: "",
        currency: "",
        amount: "",
        paymentMethod: "",//card/cash
        description: "",
        location: "",
    })

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(fetchedCategories)
        }
        fetchCategories()
    }, [])

    const handleInputChange = (e) => {

        const { name, value } = e.target
        setTransactionData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault()
        setIsCreatingTransactionLoading(true)
        setTransactionError(null)
        try {
            const res = await postRequest(`${baseUrl}/transactions/addTransaction`, JSON.stringify(transactionData))
            if (res.error) {
                return setTransactionError(res)
            }

            //clear input fields
            setTransactionData(prev => ({
                ...prev,
                type: "",
                category: "",
                currency: "",
                amount: "",
                paymentMethod: "",
                description: "",
                location: ""
            }))
        } catch (error) {
            console.error("Error creating transaction", error)
            setTransactionError(error.message)
        } finally {
            setIsCreatingTransactionLoading(false)
        }
    }

    const handleReset = (e) => {
        e.preventDefault()
        setIsCreatingTransactionLoading(false)
        setTransactionError(null)
        setTransactionData(prev => ({
            ...prev,
            type: "",
            category: "",
            currency: "",
            amount: "",
            paymentMethod: "",
            description: "",
            location: ""
        }))
    }

    const categoriesList = categories.map((category, index) => {
        return (
            <option
                key={index}
                value={`${category.name}`}
            >{category.name}</option>
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
        <div className="transaction-management">
            <h1>Transaction Management</h1>
            <form
                className="transactions-form"
                onSubmit={handleOnSubmit}
            >
                <div className="transactions-form-input">
                    <label htmlFor="type">Transaction Type:</label>
                    <select
                        id="type"
                        name="type"
                        value={transactionData.type}
                        onChange={handleInputChange}
                    >
                        <option value="">--- Select Type ---</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                </div>
                <div className="transactions-form-input">
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
                <div className="transactions-form-input">
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
                <div className="transactions-form-input">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={transactionData.amount}
                        onChange={handleInputChange}
                    ></input>
                </div>
                <div className="transactions-form-input">
                    <label htmlFor="paymentMethod">Payment Method:</label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={transactionData.paymentMethod}
                        onChange={handleInputChange}
                    >
                        <option value="">--- Select Payment Method ---</option>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                    </select>
                </div>
                <div className="transactions-form-input">
                    <label htmlFor="description">Description:</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={transactionData.description}
                        onChange={handleInputChange}
                    >
                    </input>
                </div>
                <div className="transactions-form-input">
                    <label htmlFor="location">Location:</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={transactionData.location}
                        onChange={handleInputChange}
                    ></input>
                </div>
                <button type="submit">{isCreatingTransactionLoading ? "Creating Transaction" : "Create Transaction"}</button>
                <button
                    className="btn-transactions-refresh"
                    onClick={handleReset}
                >Reset Form</button>
            </form>
            {transactionError && 
                <span className="transactions-warning">
                    {transactionError.message}
                </span>}
        </div>
    )
}