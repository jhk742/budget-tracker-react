import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest } from "../utils/services"

export default function AccountBalance() {

    const { user } = useContext(AuthContext)
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        const fetchTransactions = async () => {
            const fetchedTransacotions = await getRequest(`${baseUrl}/transactions/getTransactions/${user._id}`)
            setTransactions(fetchedTransacotions.transactions)
        }
        fetchTransactions()
    }, [])

    /**
     * <div className="categories-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoriesList}
                            </tbody>
                        </table>
                    </div>

                    
     */

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
                <td>{new Date(transaction.createdAt).toLocaleDateString("en-US")}</td>
            </tr>
        )
    })

    return (
        <div className="AccountBalance">
            ACCOUNT BALANCE
            <div className="account-balance-form-container">
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

/**
 * <div
                key={index}
                className="account-balance-transaction-info"
            >
                <span>
                    {transaction.type}
                </span>

                <span>
                    {transaction.category}
                </span>

                <span>
                    {`Base Currency Amount: ${transaction.amount}`}
                </span>

                <span>
                    {`Base Currency: ${transaction.currency}`}
                </span>

                <span>
                    {`Target Currency Amount: ${transaction.exchangedRate ? transaction.exchangedRate : transaction.amount}`}
                </span>

                <span>
                    {`Taget Currency: ${transaction.userPreferredCurrency}`}
                </span>

                <span>
                    {transaction.description ? transaction.description : ""}
                </span>

                <span>
                    {transaction.location ? transaction.location : ""}
                </span>

                <span>
                    {new Date(transaction.createdAt).toLocaleDateString("en-US")}
                </span>

            </div>
 */