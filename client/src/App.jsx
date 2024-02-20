import { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import Register from './pages/Register'
import Home from './pages/Home'


export default function App() {

  const { user } = useContext(AuthContext)

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={user ? <Home /> : <Register />} />
      </Routes>
  )
}