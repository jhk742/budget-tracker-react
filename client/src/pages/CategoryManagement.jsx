import { useCallback, useState, useEffect } from 'react'
import { baseUrl, postRequest, getRequest } from '../utils/services'


export default function CategoryManagement() {

    const [categories, setCategories] = useState([])

    useEffect(() => {
        const fetchCategories = async () => {
            const categories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(categories)
        }
        fetchCategories()
    }, [])

    const categoriesList = categories.map((category, index) => {
        const { name, description } = category
        return (
            <tr key={index}>
                <td>{name}</td>
                <td>{description}</td>
            </tr>
        )
    })

    return (
        <div className="CategoryManagement">
            <div className="categories-container">
                <h1>Category Management</h1>
                <div className="categories-services-container">
                    <div className="categories-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoriesList}
                            </tbody>
                        </table>
                    </div>
                    <div className="categories-functions">
                        STUFF
                    </div>
                </div>
            </div>
        </div>
    )
}