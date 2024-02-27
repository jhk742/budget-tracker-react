import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function ReceiptUpload() {

    const { user } = useContext(AuthContext)

    const [imageData, setImageData] = useState({
        userId: user._id,
        name: "",
        data: ""
    })

    console.log(imageData)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImageData(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // console.log(imageData)
    const handleSubmit = (e) => {
        e.preventDefault()
        if (imageData) {
            const formData = new FormData()
            formData.append('image', imageData)

            console.log(formData)
        }
    }

    return (
        <div>
            <form
                onSubmit={handleSubmit}
            >
                <label htmlFor="image-upload">
                    Upload Receipt Image:
                    <input
                        type="file"
                        id="image-upload"
                        name="image-upload"
                        onChange={handleImageChange}
                    ></input>
                </label>
                <button
                    type="submit"
                >SUBMIT</button>
            </form>
            {imageData && 
            <img 
                src={imageData} 
                style={{height: "400px", width: "400px"}}
            />}
        </div>
    )
}