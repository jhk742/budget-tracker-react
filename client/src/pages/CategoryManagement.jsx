import { useCallback, useState, useEffect } from 'react'
import { baseUrl, postRequest, getRequest } from '../utils/services'


export default function CategoryManagement() {

    const [categories, setCategories] = useState([])
    const [isAddingLoading, setIsAddingLoading] = useState(false)
    const [addingCategoryError, setAddingCategoryError] = useState(null)
    const [categoryData, setCategoryData] = useState({
        name: "",
        description: ""
    })

    // console.log(categories)

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(fetchedCategories)
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

    const handleChange = (e) => {
        const { name, value } = e.target
        setCategoryData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault()
        setIsAddingLoading(true)
        setAddingCategoryError(null)

        try {
            const res = await postRequest(`${baseUrl}/categories/addItem`, JSON.stringify(categoryData))
            if (res.error) {
                return setAddingCategoryError(res)
            }
            setCategories(prev => [...prev, res])
        } catch (error) {
            console.error("Error adding category: ", error)
            setAddingCategoryError(error.message)
        } finally {
            setIsAddingLoading(false)
        }
    }

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
                        <form 
                            className="categories-form"
                            onSubmit={handleOnSubmit}
                        >
                            <div className="categories-form-input">
                                <label htmlFor="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={categoryData.name}
                                    onChange={handleChange}
                                ></input>
                            </div>
                            <div className="categories-form-input">
                                <label htmlFor="description">Description:</label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={categoryData.description}
                                    onChange={handleChange}
                                ></input>
                            </div>
                            <button 
                                type="submit"
                            >
                                {isAddingLoading ? "Adding Category" : "Add Category"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}