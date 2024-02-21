import { useCallback, useState, useEffect } from 'react'
import { baseUrl, postRequest, getRequest } from '../utils/services'


export default function CategoryManagement() {

    const [categories, setCategories] = useState([])
    const [isAddingLoading, setIsAddingLoading] = useState(false)
    const [addingCategoryError, setAddingCategoryError] = useState(null)
    const [categoryData, setCategoryData] = useState({
        _id: "",
        name: "",
        description: ""
    })

    const [selectedRow, setSelectedRow] = useState(null)

    console.log(categoryData._id, categoryData.name, categoryData.description)

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(fetchedCategories)
        }
        fetchCategories()
    }, [])

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
            
            console.log(res)
            
            if (res.error) {
                return setAddingCategoryError(res)
            }
            setCategories(prev => [...prev, res])
            //to clear the input fields
            setCategoryData({
                _id: "",
                name: "",
                description: ""
            })
        } catch (error) {
            console.error("Error adding category: ", error)
            setAddingCategoryError(error.message)
        } finally {
            setIsAddingLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
    }

    //this function changes state, causing a change in the rendering of the component
    //thus, react will re-render the comp to reflect the updated state including the
    //categoriesList jsx expression
    const handleRowClick = (e, category) => {
        const { _id, name, description } = category

        //if the row is already selected, 
        setSelectedRow(prev => prev === _id ? null : _id)

        //setCategoryData (so as to bring in the information to the input fields)
        setCategoryData({
            _id,
            name,
            description
        })
    }

    const categoriesList = categories.map((category, index) => {
        const { _id, name, description } = category

        //determine if the current row is clicked
        const isClicked = selectedRow === _id

        //define the class name based on the clicked state
        const rowClassName = isClicked ? 'clicked-row' : ""

        return (
            <tr 
                key={index} 
                className={`category-table-row ${rowClassName}`}
                onClick={(e) => handleRowClick(e, category)}
            >
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
                                disabled={selectedRow}
                            >
                                {isAddingLoading ? "Adding Category" : "Add Category"}
                            </button>
                            <button
                                disabled={!selectedRow}
                            >
                                Update Category
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}