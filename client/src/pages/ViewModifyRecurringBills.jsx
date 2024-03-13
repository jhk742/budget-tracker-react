import { useState, useContext, useEffect} from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest } from '../utils/services'

export default function ViewModifyRecurringBills() {

    const { user } = useContext(AuthContext)
    const [bills, setBills] = useState({
        initialBills: [],
        associatedBills: []
    })
    const [viewBill, setViewBill] = useState({
        view: false,
        index: null
    })

    const initialBills = bills.initialBills.map((transaction, index) => {
        const { description, currency, exchangedRate, amount, userPreferredCurrency } = transaction
        const { value, unit, startingDate } = transaction.timeElapsedBeforeNextPayment
        return (
            <tr 
                key={index}
                className="recurring-bills-table-row"
                onClick={() => setViewBill({
                    view: true,
                    index
                })}
            >
                <td>{description}</td>
                <td>{new Date(startingDate).toLocaleDateString('en-us')}</td>
                <td>{`${value} ${unit}(s)`}</td>
                <td>{currency}</td>
                <td>{amount}</td>
                <td>{exchangedRate ? exchangedRate : amount} ({userPreferredCurrency.substring(0, 3)})</td>
                <td>{bills.associatedBills[index].length}</td>
            </tr>
        )
    })

    const specificBill = viewBill.index !== null && bills.associatedBills[viewBill.index] !== undefined
    ? bills.associatedBills[viewBill.index].map((transaction, index) => {
        const { description, currency, exchangedRate, amount, userPreferredCurrency } = transaction
        const { value, unit, startingDate } = transaction.timeElapsedBeforeNextPayment
        return (
            <tr key={index}>
                <td>{description}</td>
                <td>{new Date(startingDate).toLocaleDateString('en-us')}</td>
                <td>{`${value} ${unit}(s)`}</td>
                <td>{currency}</td>
                <td>{amount}</td>
                <td>{exchangedRate ? exchangedRate : amount} ({userPreferredCurrency.substring(0, 3)})</td>
            </tr>
        )
    })
    : null

    useEffect(() => {
        const fetchRecurringBills = async () => {
            try {
                const bills = await getRequest(`${baseUrl}/transactions/getRecurringBills/${user._id}`)
                setBills(bills)
            } catch (error) {
                console.error(error)
                return new Error(`Error fetching bills: ${error.message}`) // Return null or handle the error condition
            }
        }
        fetchRecurringBills()
    }, [])

    return (
        <div className="recurring-bills-view-modify">
            {viewBill.view === false 
            ? (
                <table
                    className="recurring-bills-table"
                >
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>First Payment Date</th>
                            <th>Interval Between Payments</th>
                            <th>Currency Used for Payment</th>
                            <th>Amount Paid in Base Currency</th>
                            <th>Amount Paid in Preferred Currency</th>
                            <th>Additional Payments Made Towards this Bill</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialBills}
                    </tbody>
                </table>
            )
            : (
                <div>
                    <button
                        onClick={() => setViewBill({
                            view: false,
                            index: null
                        })}
                    >BACK</button>
                    <h2>Initial Payment:</h2>
                    <table
                        className="recurring-bills-table-specific"
                    >
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>First Payment Date</th>
                                <th>Interval Between Payments</th>
                                <th>Currency Used for Payment</th>
                                <th>Amount Paid in Base Currency</th>
                                <th>Amount Paid in Preferred Currency</th>
                                <th>Additional Payments Made Towards this Bill</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{bills.initialBills[viewBill.index].description}</td>
                                <td>{new Date(bills.initialBills[viewBill.index].timeElapsedBeforeNextPayment.startingDate).toLocaleDateString('en-us')}</td>
                                <td>{`${bills.initialBills[viewBill.index].timeElapsedBeforeNextPayment.value} ${bills.initialBills[viewBill.index].timeElapsedBeforeNextPayment.unit}(s)`}</td>
                                <td>{bills.initialBills[viewBill.index].currency}</td>
                                <td>{bills.initialBills[viewBill.index].amount}</td>
                                <td>{bills.initialBills[viewBill.index].exchangedRate ? bills.initialBills[viewBill.index].exchangedRate : bills.initialBills[viewBill.index].amount} ({bills.initialBills[viewBill.index].userPreferredCurrency.substring(0, 3)})</td>
                                <td>{bills.associatedBills[viewBill.index].length}</td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Subsequent Payments:</h2>
                    <table
                        className="recurring-bills-table-specific"
                    >
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Payment Date</th>
                                <th>Interval Between Payment</th>
                                <th>Currency Used for Payment</th>
                                <th>Amount Paid in Base Currency</th>
                                <th>Amount Paid in Preferred Currency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {specificBill}
                        </tbody>
                    </table>
                </div>
            )
            }
        </div>
    )
}