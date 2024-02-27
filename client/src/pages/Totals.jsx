import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest} from '../utils/services'

export default function Totals() {
    const { user } = useContext(AuthContext)
    const [totalExpenditure, setTotalExpenditure] = useState(null)
    const [totalIncome, setTotalIncome] = useState(null)

    useEffect(() => {

    }, [])

    return (
        <div>

            <span>{`${Number(user.balance).toFixed(2)} ${user.preferredCurrency.substring(0, 3)}`}</span>

        </div>
    )
}