import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest } from "../utils/services"

export default function AccountBalance() {

    const { user } = useContext(AuthContext)
    const [transactions, setTransactions] = useState([])
    const [filterData, setFilterData] = useState({
        date: "",
        transactionType: "",
        paymentMethod: ""
    })

    useEffect(() => {
        const fetchTransactions = async () => {
            const fetchedTransactions = await getRequest(`${baseUrl}/transactions/getTransactions/${user._id}`)
            setTransactions(fetchedTransactions.transactions)
        }
        fetchTransactions()
    }, [])

    const transactionsList = transactions.map((transaction, index) => {
        const { type, 
            category, 
            currency, 
            amount, 
            exchangedRate, 
            userPreferredCurrency, 
            paymentMethod, 
            description, 
            location, 
            createdAt } = transaction
        return (
            <tr
                key={index}
            >
                <td>{type}</td>
                <td>{category}</td>
                <td>{currency}</td>
                <td>{amount}</td>
                <td>{userPreferredCurrency}</td>
                <td>{exchangedRate ? exchangedRate : amount}</td>
                <td>{paymentMethod}</td>
                <td>{description ? description : ""}</td>
                <td>{location ? location : ""}</td>
                <td>{new Date(createdAt).toLocaleDateString("en-US")}</td>
            </tr>
        )
    })

    const handleFilters = (e) => {
        const { name, value } = e.target
        setFilterData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await getRequest(`${baseUrl}/transactions/getFilteredTransactions/${user._id}/${filterData.transactionType || "null"}/${filterData.paymentMethod || "null"}/${filterData.date || "null"}`)
            setTransactions(res.transactions)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="AccountBalance">
            <h1>Account Balance</h1>
            <div className="account-balance-form-container">
                <div className="account-balance-filter-container">
                    <h2>Filter Options</h2>
                    <form 
                        onSubmit={handleSubmit}
                    >
                        <div className="filter-options">
                            <div className="filter-option">
                                <label htmlFor="date">Date:</label>
                                <select
                                    id="date"
                                    name="date"
                                    value={filterData.date}
                                    onChange={handleFilters}
                                >
                                    <option value="">--- Select Date Component --- </option>
                                    <option value="day">By Day</option>
                                    <option value="month">By Month</option>
                                    <option value="year">By Year</option>
                                </select>
                            </div>
                            <div className="filter-option">
                                <label htmlFor="transactionType">Transaction Type:</label>
                                <select
                                    id="transactionType"
                                    name="transactionType"
                                    value={filterData.transactionType}
                                    onChange={handleFilters}
                                >
                                    <option value="">--- Select Transaction Type ---</option>
                                    <option value="expense">By Expense</option>
                                    <option value="income">By Income</option>
                                </select>
                            </div>
                            <div className="filter-option">
                                <label htmlFor="paymentMethod">Payment Method:</label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={filterData.paymentMethod}
                                    onChange={handleFilters}
                                >
                                    <option value="">--- Select Payment Method ---</option>
                                    <option value="card">By Card</option>
                                    <option value="cash">By Cash</option>
                                </select>
                            </div>
                        </div>
                        <div className="btn-filters">
                            <button 
                                type="submit"
                            >APPLY FILTER(S)</button>
                            <button
                                onClick={() => {
                                    setFilterData(prev => ({
                                        ...prev,
                                        date: "",
                                        transactionType: "",
                                        paymentMethod: ""
                                    }))
                                }}
                            >RESET FILTER(S) / ALL RESULTS</button>
                        </div>
                    </form>
                </div>
                <div className="account-balance-transactions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Transaction Type</th>
                                <th>Category</th>
                                <th>Base Currency</th>
                                <th>Base Currency Amount</th>
                                <th>Target Currency</th>
                                <th>Target Currency Amount</th>
                                <th>Payment Method</th>
                                <th>Description</th>
                                <th>Location</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionsList}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}