import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest} from '../utils/services'

export default function Totals() {
    const { user } = useContext(AuthContext)
    // const [totalExpenditure, setTotalExpenditure] = useState(null)
    // const [totalIncome, setTotalIncome] = useState(null)
    const [filterData, setFilterData] = useState({
        category: ""
    })
    const [totals, setTotals] = useState(null)

    useEffect(() => {
        const fetchTotals = async () => {
            const totals = await getRequest(`${baseUrl}/transactions/getTotals/${user._id}/${filterData.category || "null"}`)
            setTotals(totals)
        }
        fetchTotals()
    }, [])

    console.log(totals)

    return (
        <div>

            <span>{`${Number(user.balance).toFixed(2)} ${user.preferredCurrency.substring(0, 3)}`}</span>
            <span>{`TOTAL INCOME PREFERRED CURRENCY: ${totals?.totalIncomePreferredCurrency} - ${user.preferredCurrency}`}</span>
            <span>{`TOTAL EXPENDITURE PREFERRED CURRENCY: ${totals?.totalExpensePreferredCurrency} - ${user.preferredCurrency}`}</span>
            <span>{`TOTAL INCOME BASE CURRENCY ${totals?.totalIncomeBaseCurrency} - ${totals?.baseCurrencies[0]}`}</span>
            <span>{`TOTAL EXPENDITURE BASE CURRENCY ${totals?.totalExpenseBaseCurrency} - ${totals?.baseCurrencies[0]}`}</span>
            <span></span>
        </div>
    )
}