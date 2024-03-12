import { useContext, useEffect } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest } from '../utils/services'

export default function Home() {

    const { user } = useContext(AuthContext)

    useEffect(() => {
        const recurringBillsCheck = async () => {
            const totals = await getRequest(`${baseUrl}/transactions/payRecurringBills/${user._id}`)
        }
        recurringBillsCheck()
    }, [])
    
    return (
        <div className="Home">
            <span>Current Balance: { Number(user.balance).toFixed(2) }</span>
            <span>({ user.preferredCurrency })</span>
            <div className="home-features-container">
                <Link to="/category-management">Category Management</Link>
                <Link to="/transaction-management">Transaction Management</Link>
                <Link to="/account-balance">Account Balance</Link>
                <Link to="/totals">Totals</Link>
                <Link to="/recurring-bills">Recurring Bills</Link>
                <Link to="/view-modify-recurring-bills">View/Modify Recurring Bills</Link>
                <Link to="/receipt-upload">Upload Receipt</Link>
            </div>
        </div>
    )
}