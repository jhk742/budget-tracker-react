import { useState, useEffect, useContext } from 'react'
import { baseUrl, postRequest, getRequest} from '../utils/services'
import { supportedCurrencies } from '../utils/currencies'
import { AuthContext } from '../context/AuthContext'

export default function TransactionManagement() {
    const { user, updateUserBalance } = useContext(AuthContext)
    const [categories, setCategories] = useState([])
    const [isCreatingTransactionLoading, setIsCreatingTransactionLoading] = useState(false)
    const [transactionError, setTransactionError] = useState(null)
    const [transactionSuccess, setTransactionSuccess] = useState(null)
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

        if (name === "type" && value === "Income") {
            setTransactionData(prev => ({
                ...prev,
                category: "Category input not required for income"
            }))
            //the return itself is not required as the category input
            //will be disabled and will already be set with the text provided above,
            //but better safe than sorry...
            return
        }

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
            if (transactionData.type === "Expense" && (user.balance - transactionData.amount < 0)) {
                return setTransactionError({ message: "The amount you've entered exceeds your current balance." })
            }

            const res = await postRequest(`${baseUrl}/transactions/addTransaction`, JSON.stringify(transactionData))
            if (res.error) {
                return setTransactionError(res)
            }

            // // Update user's balance in the database
            updateUserBalance(transactionData.type === "Income" ? Number(user.balance) + Number(transactionData.amount) : user.balance - transactionData.amount)

            setTransactionSuccess("Transaction created successfully!")

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

    useEffect(() => {
        const getExchangeRate = async () => {
            const exchangeRateData = {
                amount: transactionData.amount,
                preferredCurrency: user.preferredCurrency.substring(0, 3),
                providedCurrency: transactionData.currency.substring(0, 3)
            }
    
            try {
                const res = await postRequest(`${baseUrl}/transactions/convertRate`, JSON.stringify(exchangeRateData));
                return res.exchangedRate // Return the exchanged rate
            } catch (error) {
                console.error(error)
                return new Error(`Error fetching exchange rate: ${error.message}`) // Return null or handle the error condition
            }
        }

        const fetchExchangeRate = async () => {
            try {
                if (transactionData.amount && transactionData.currency) {
                    const exchangedRate = await getExchangeRate()
                    console.log(exchangedRate)
                } 
            } catch (error) {
                console.error(`Error fetching exchange rate`, error)
            }
        }

        fetchExchangeRate()
    }, [transactionData.currency, transactionData.amount])

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
            {transactionSuccess && 
                <div className="transaction-alert-success">
                    <span>{transactionSuccess}</span>
                    <button 
                        className="close-successful-alert"
                        onClick={() => {
                            setTransactionSuccess(null)
                        }}
                    >
                        Close
                    </button>
                </div>
            }
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
                        disabled={transactionData.type === "Income"}
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
                {/**IF user.preferredCurrency !== transactionData?.currency ,
                 * have a <div>that shows the converted rate that is to be added
                 * in place of the provided amount
                 * 
                 */
                    // <div className="transactions-form-input"> 
                    //     <label>CONVERTED RATE:</label>
                    //     <textarea
                    //         readOnly
                    //         value={(user.preferredCurrency !== transactionData.currency) && transactionData.currency !== "" && transactionData.amount !== "" && transactionData.amount > 0 ? getExchangeRate() : ""}
                    //     >
                    //         {}
                    //     </textarea>
                    // </div>
                }
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle tx-warning-sign" viewBox="0 0 16 16">
                        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                    </svg>
                    {transactionError.message}
                    <button 
                        className="btn-close-warning"
                        onClick={() => {
                            setTransactionError(null)
                        }}
                    >
                        X
                    </button>
                </span>
                
            }
        </div>
    )
}