import { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import NavBar from './components/NavBar'
import Home from './pages/Home'

import AccountBalance from './pages/AccountBalance'
import CategoryManagement from './pages/CategoryManagement'
import TransactionManagement from './pages/TransactionMangement'
import Totals from './pages/Totals'
import RecurringBills from './pages/RecurringBills'
import ReceiptUpload from './pages/ReceiptUpload'
import ViewModifyRecurringBills from './pages/ViewModifyRecurringBills'

export default function App() {

  const { user } = useContext(AuthContext)

  return (
    <>
      <NavBar />
      <>
        <Routes>
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route path="/register" element={user ? <Home /> : <Register />} />
          <Route path="/login" element={user ? <Home /> : <Login />} />
          <Route path="/category-management" element={user ? <CategoryManagement /> : <Login />}/>
          <Route path="/transaction-management" element={user ? <TransactionManagement /> : <Login />}/>
          <Route path="/account-balance" element={user ? <AccountBalance /> : <Login />}/>
          <Route path="/totals" element={user ? <Totals /> : <Login />} />
          <Route path="/recurring-bills" element={user ? <RecurringBills /> : <Login />} />
          <Route path="/view-modify-recurring-bills" element={user ? <ViewModifyRecurringBills /> : <Login />} />
          <Route path="/receipt-upload" element={user ? <ReceiptUpload /> : <Login />} />
        </Routes>
      </>
    </>
  )
}