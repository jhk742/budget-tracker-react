import { useContext } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Home() {

    const { user } = useContext(AuthContext)
    
    return (
        <div className="Home">
            <span>Current Balance: { Number(user.balance).toFixed(2) }</span>
            <span>({ user.preferredCurrency })</span>
            <div className="home-features-container">
                <Link to="/category-management">Category Management</Link>
                <Link to="/transaction-management">Transaction Management</Link>
                <Link to="/account-balance">Account Balance</Link>
                <Link to="/totals">Totals</Link>
                <Link to="/receipt-upload">Upload Receipt</Link>
            </div>
        </div>
    )
}