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
    const [transactions, setTransactions] = useState(null)

    console.log(transactions)
    console.log(filterData)
    // const stuff = transactions.map((transaction) => {
        
    // })

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

    const alternativeCurrenciesExpensesByCategory = ((transactions && transactions.alternativeCurrenciesTotalExpense)
        ? transactions.alternativeCurrenciesTotalExpense.map((currency, index) => {
            return (
                <div
                    key={index}
                    className="alternative-currencies-info"
                >
                    <h4>{currency.currency}</h4>
                    <span>{`${currency.baseTotal} (${currency.currency.substring(0, 3)}) == ${currency.exchangedTotal} (${user.preferredCurrency.substring(0, 3)})`}</span>
                </div>
            )
        })
        : null
    )

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
            if (filterData.category) {
                const res = await getRequest(`${baseUrl}/transactions/getCategoryExpenses/${filterData.userId}/${filterData.category}`)
                setTransactions(res)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div>
                <button
                    onClick={() => {
                        setViewOption("totals")
                        setTransactions(null)
                        setFilterData((prev) => ({
                            ...prev,
                            category: ""
                        }))
                    }}
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
                                <label htmlFor="category">Selected Category:</label>
                                <select
                                    id="category"
                                    name="category"
                                    onChange={(e) => {
                                        const { name, value } = e.target
                                        setFilterData((prev) => ({
                                            ...prev,
                                            [name]: value
                                        }))
                                    }}
                                >
                                    <option value="">--- Select Category ---</option>
                                    {categoriesList}
                                </select>
                            </div>
                            <button type="submit">APPLY</button>
                        </form>
                        {(transactions && transactions.alternativeCurrenciesTotalExpense)
                            ? (
                                <div className="Totals">
                                    <div className="totals-info">
                                        <div className="totals-sub-info">
                                            <h2>
                                                {`Total Expense`}
                                            </h2>
                                            <span>
                                                {`${transactions?.total} (${user.preferredCurrency.substring(0, 3)})`}
                                            </span>
                                        </div>
                                        <div className="totals-sub-info">
                                            <h2>
                                                Expense of Preferred Currency
                                            </h2>
                                            <h4>{user.preferredCurrency}</h4>
                                            <span>
                                                {`${transactions.preferredCurrencyTotal} (${user.preferredCurrency.substring(0, 3)})`}
                                            </span>
                                        </div>
                                        <div className="totals-sub-info">
                                            <h2>
                                                Expense for Alternative Currencies
                                            </h2>
                                            {alternativeCurrenciesExpensesByCategory}
                                        </div>
                                    </div>
                                </div>
                                )
                            : `${transactions?.message ? transactions.message : ""}`
                        }
                    </div>
                )
            }
            
        </>
    )
}