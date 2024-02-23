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

    const transactionsList = transactions.map((transaction, index) => {
        return (
            <div
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
        )
    })

    return (
        <div className="AccountBalance">
            ACCOUNT BALANCE
            <div className="account-balance-form-container">
                {transactionsList}
            </div>
        </div>
    )
}