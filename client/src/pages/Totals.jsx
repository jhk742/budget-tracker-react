import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest} from '../utils/services'

export default function Totals() {
    const { user } = useContext(AuthContext)
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

    const alternativeCurrenciesIncome = (totals && totals.alternativeCurrenciesIncome)
        ? totals.alternativeCurrenciesIncome.map((currency, index) => {
            return (
                <div key={index} className="alternative-currencies-info">
                    <h4>{currency.currency}</h4>
                    <span>{`${currency.baseTotal} (${currency.currency.substring(0, 3)}) == ${currency.exchangedTotal} (${user.preferredCurrency.substring(0, 3)})`}</span>
                </div>
            )
        })
        : null

    const alternativeCurrenciesExpenses = (totals && totals.alternativeCurrenciesExpenses)
    ? totals.alternativeCurrenciesExpenses.map((currency, index) => {
        return (
            <div key={index} className="alternative-currencies-info">
                <h4>{currency.currency}</h4>
                <span>{`${currency.baseTotal} (${currency.currency.substring(0, 3)}) == ${currency.exchangedTotal} (${user.preferredCurrency.substring(0, 3)})`}</span>
            </div>
        )
    })
    : null

    return (
        <div className="Totals">
            <div className="totals-info">
                <div className="totals-sub-info">
                    <h2>{`Total (in Preferred Currency: ${user.preferredCurrency.substring(0, 3)})`}</h2>
                    <span>{`Total Balance: ${Number(user.balance).toFixed(2)} (${user.preferredCurrency.substring(0, 3)})`}</span>
                    <span>{`Total Income: ${totals?.totalIncomePreferredCurrency} (${user.preferredCurrency.substring(0, 3)})`}</span>
                    <span>{`Total Expenditure: ${totals?.totalExpensePreferredCurrency} (${user.preferredCurrency.substring(0, 3)})`}</span>
                </div>
                <div className="totals-sub-info">
                    <h2>Income from Alternative Currencies</h2>
                    {alternativeCurrenciesIncome}
                </div>
                <div className="totals-sub-info">
                    <h2>Expenses for Alternative Currencies</h2>
                    {alternativeCurrenciesExpenses}
                </div>
            </div>
        </div>
    )
}