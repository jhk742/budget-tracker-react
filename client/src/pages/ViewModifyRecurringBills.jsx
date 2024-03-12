import { useState, useContext, useEffect} from 'react'
import { AuthContext } from '../context/AuthContext'
import { baseUrl, getRequest } from '../utils/services'

export default function ViewModifyRecurringBills() {

    const { user } = useContext(AuthContext)
    const [bills, setBills] = useState([])

    const initialBills = bills.map((transaction) => {
        return (
            <div className="recurring-bills-initial-bills">
                <span>{transaction.description}</span>
                <span>{new Date(transaction.timeElapsedBeforeNextPayment.startingDate).toLocaleDateString('en-us')}</span>
                <span>{`Paid currency: ${transaction.currency}`}</span>
                {(transaction.currency !== transaction.userPreferredCurrency) && <span>{`Paid amount in base currency: ${transaction.amount}`}</span>}
                <span>{`Paid amount in preferred currency: ${transaction.exchangedRate ? transaction.exchangedRate : transaction.amount}`}</span>
            </div>
        )
    })

    useEffect(() => {
        const fetchRecurringBills = async () => {
            try {
                const bills = await getRequest(`${baseUrl}/transactions/getRecurringBills/${user._id}`)
                setBills(bills.initialBills)
            } catch (error) {
                console.error(error)
                return new Error(`Error fetching bills: ${error.message}`) // Return null or handle the error condition
            }
        }
        fetchRecurringBills()
    }, [])

    return (
        <div className="recurring-bills-view-modify">{initialBills}</div>
    )
}