import { useState, useContext, useEffect} from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest } from '../utils/services'

export default function ViewModifyRecurringBills() {

    const { user } = useContext(AuthContext)
    const [bills, setBills] = useState({
        initialBills: [],
        associatedBills: []
    })

    const initialBills = bills.initialBills.map((transaction, index) => {
        const { description, currency, exchangedRate, amount, userPreferredCurrency } = transaction
        const { value, unit, startingDate } = transaction.timeElapsedBeforeNextPayment
        return (
            <tr 
                key={index}
            >
                <td>{description}</td>
                <td>{new Date(startingDate).toLocaleDateString('en-us')}</td>
                <td>{`${value} ${unit}(s)`}</td>
                <td>{currency}</td>
                <td>{amount}</td>
                <td>{exchangedRate ? exchangedRate : amount} ({user.preferredCurrency.substring(0, 3)})</td>
                <td>{bills.associatedBills[index].length}</td>
            </tr>
        )
    })

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
            <table
                className="recurring-bills-table"
            >
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>First Payment</th>
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
        </div>
    )
}