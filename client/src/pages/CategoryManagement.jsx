import { useCallback, useState, useEffect } from 'react'
import { baseUrl, postRequest, getRequest, patchRequest, deleteRequest } from '../utils/services'


export default function CategoryManagement() {

    const [categories, setCategories] = useState([])
    const [selectedRow, setSelectedRow] = useState(null)
    const [isAddingLoading, setIsAddingLoading] = useState(false)
    const [addingCategoryError, setAddingCategoryError] = useState(null)
    const [isUpdateLoading, setIsUpdateLoading] = useState(false)
    const [updatingCategoryError, setUpdatingCategoryError] = useState(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const [deletingCategoryError, setDeletingCategoryError] = useState(null)
    const [categoryData, setCategoryData] = useState({
        _id: "",
        name: "",
        description: ""
    })

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getRequest(`${baseUrl}/categories/getCategories`)
            setCategories(fetchedCategories)
        }
        fetchCategories()
    }, [])
    
    useEffect(() => {
        // Clear input fields if no row is selected
        if (!selectedRow) {
            setCategoryData({
                _id: "",
                name: "",
                description: ""
            });
        }
    }, [selectedRow]);
    
    useEffect(() => {
        // Set category data when a row is selected
        if (selectedRow) {
            const category = categories.find(category => category._id === selectedRow);
            if (category) {
                const { _id, name, description } = category;
                setCategoryData({
                    _id,
                    name,
                    description
                });
            }
        }
    }, [selectedRow, categories]);

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

            ////create a state to show on successful operation
            console.log("Successfully added category", res)

            //optimistic ui
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
        setIsUpdateLoading(true)
        setUpdatingCategoryError(null)
        try {
            const res = await patchRequest(`${baseUrl}/categories/updateCategory`, JSON.stringify(categoryData))

            if (res.error) {
                return setUpdatingCategoryError(res)
            }

            ////create a state to show on successful operation
            console.log("Category updated successfully", res)

            //optimistic ui - update existing category with the new data
            const updatedCategories = categories.map((category) => {
                if (res._id === category._id) {
                    return ({
                        ...category,
                        name: res.name,
                        description: res.description
                    })
                } else {
                    return category
                }
            })
            setCategories(updatedCategories)

            //clear input fields
            setCategoryData({
                _id: "",
                name: "",
                description: ""
            })
            setSelectedRow(null)
        } catch (error) {
            console.error("Error updating category: ", error)
            setUpdatingCategoryError(error.message)
        } finally {
            setIsUpdateLoading(false)
        }
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        setIsDeleteLoading(true)
        setDeletingCategoryError(null)
        try {
            const res = await deleteRequest(`${baseUrl}/categories/deleteCategory/${categoryData._id}/${categoryData.name}`)
            
            if (res.error)
                return setDeletingCategoryError(res)

                //create a state to show on successful operation
            console.log("Category deleted successfully.", res)

            //update existing category by omitting the one that's been deleted
            const updatedCategories = categories.filter((category) => category._id !== res._id)
            setCategories(updatedCategories)

            //clear input fields
            setCategoryData({
                _id: "",
                name: "",
                description: ""
            })

            setSelectedRow(null)
        } catch (error) {
            console.log(error)
            setDeletingCategoryError(error.message)
        } finally {
            setIsDeleteLoading(false)
        }
    }

    //this function changes state, causing a change in the rendering of the component
    //thus, react will re-render the comp to reflect the updated state including the
    //categoriesList jsx expression
    const handleRowClick = (e, category) => {
        const { _id } = category

        //if the row is already selected, 
        setSelectedRow(prev => prev === _id ? null : _id)

        //set errors to null to hide warning message
        setAddingCategoryError(null)
        setUpdatingCategoryError(null)
        setDeletingCategoryError(null)
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
                                onClick={handleUpdate}
                            >
                                {isUpdateLoading ? "Updating Category" : "Update Category"}
                            </button>
                        </form>
                        <button
                            disabled={!selectedRow}
                            onClick={handleDelete}
                            className="btn-delete-category"
                        >
                            {isDeleteLoading ? "Delete Category" : "Delete Category"}
                        </button>
                        
                        {
                            ((addingCategoryError || updatingCategoryError || deletingCategoryError) && selectedRow) &&
                            (<div className="error-alert-category">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                                </svg>
                                {addingCategoryError && <span>{addingCategoryError?.message}</span>}
                                {updatingCategoryError && <span>{updatingCategoryError?.message}</span>}
                                {deletingCategoryError && <span>{deletingCategoryError?.message}</span>}
                                <button 
                                    className="btn-close-warning"
                                    onClick={() => {
                                        setAddingCategoryError(null)
                                        setUpdatingCategoryError(null)
                                        setDeletingCategoryError(null)
                                    }}
                                >X</button>
                            </div>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}