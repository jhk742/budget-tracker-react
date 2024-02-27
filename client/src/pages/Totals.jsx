import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest} from '../utils/services'


export default function Totals() {
    const { user } = useContext(AuthContext)
    const [filterData, setFilterData] = useState({
        userId: user._id,
        category: ""
    })
    const [totals, setTotals] = useState(null)
    const [viewOption, setViewOption] = useState("totals")
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])

    console.log(transactions)


    useEffect(() => {
        const fetchTotals = async () => {
            const totals = await getRequest(`${baseUrl}/transactions/getTotals/${user._id}/${filterData.category || "null"}`)
            setTotals(totals)
        }
        fetchTotals()
    }, [])

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(fetchedCategories)
        }
        fetchCategories()
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

    const categoriesList = categories.map((category, index) => {
        return (
            <option
                key={index}
                value={`${category.name}`}
            >{category.name}</option>
        )
    })

    const grabCategoryExpenses = async (e) => {
        e.preventDefault()
        try {
            const res = await getRequest(`${baseUrl}/transactions/getCategoryExpenses/${filterData.userId}/${filterData.category}`)
            setTransactions(res)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div>
                <button
                    onClick={() => setViewOption("totals")}
                >Totals</button>
                <button
                    onClick={() => setViewOption("categories")}
                >Expense By Category</button>
            </div>
            {viewOption === "totals"
                ?
                    (
                        <div className="Totals">
                            <div className="totals-info">
                                <div className="totals-sub-info">
                                    <h2>{`Total (in Preferred Currency: ${user.preferredCurrency.substring(0, 3)})`}</h2>
                                    <span>{`Total Balance: ${Number(user.balance).toFixed(2)} (${user.preferredCurrency.substring(0, 3)})`}</span>
                                    <span>{`Total Income: ${totals?.totalIncomePreferredCurrency} (${user.preferredCurrency.substring(0, 3)})`}</span>
                                    <span>{`Total Expenditure: ${totals?.totalExpensePreferredCurrency} (${user.preferredCurrency.substring(0, 3)})`}</span>
                                </div>
                                <div className="totals-sub-info">
                                    <h2>Income / Expense of Preferred Currency</h2>
                                    <h4>{user.preferredCurrency}</h4>
                                    <span>{`Income: ${totals?.incomePreferredCurrency} (${user.preferredCurrency.substring(0, 3)})`}</span>
                                    <span>{`Expense: ${totals?.expensePreferredCurrency} (${user.preferredCurrency.substring(0, 3)})`}</span>
                                </div>
                                <div className="totals-sub-info">
                                    <h2>Income from Alternative Currencies</h2>
                                    {alternativeCurrenciesIncome}
                                    <h3 className="alternative-total">{`Total Income: ${totals?.alternativeCurrenciesTotalIncome} (${user.preferredCurrency.substring(0, 3)})`}</h3>
                                </div>
                                <div className="totals-sub-info">
                                    <h2>Expenses for Alternative Currencies</h2>
                                    {alternativeCurrenciesExpenses}
                                    <h3 className="alternative-total">{`Total Expense: ${totals?.alternativeCurrenciesTotalExpense} (${user.preferredCurrency.substring(0, 3)})`}</h3>
                                </div>
                            </div>
                        </div>
                    )
                : (
                    <div>
                        <form onSubmit={grabCategoryExpenses}>
                            <div className="totals-form-input">
                                <label htmlFor="category">Select Category:</label>
                                <select
                                    id="category"
                                    name="category"
                                    onChange={(e) => {
                                        setFilterData((prev) => {
                                            const { name, value } = e.target
                                            return ({
                                                ...prev,
                                                [name]: value
                                            })
                                        })
                                    }}
                                >
                                    <option value="">--- Select Category ---</option>
                                    {categoriesList}
                                </select>
                            </div>
                            <button type="submit">APPLY</button>
                        </form>
                    </div>
                )
            }
            
        </>
    )
}