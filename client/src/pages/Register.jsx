import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Register() {

    const { updateRegisterInfo,
            registerUser,
            registerError,
            isRegisterLoading } = useContext(AuthContext)

    const handleChange = (e) => {
        const { name, value } = e.target
        updateRegisterInfo(prev => ({
            ...prev,
            [name]: value
        })) 
    }

    return (
        <div className="Register">
            <div className="register-box">
                <form className="register-form" onSubmit={registerUser}>
                    <label className="register-form-title">
                        Register User
                    </label>
                    <label>
                        Name:
                        <input 
                            type="text"
                            name="name"
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input 
                            type="email"
                            name="email"
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Password:
                        <input 
                            type="password" 
                            name="password"
                            onChange={handleChange}
                        />
                    </label>
                    <button 
                        type="submit" 
                        className="btn-register-submit"
                        
                    >
                            REGISTER
                    </button>
                </form>
            </div>
        </div>
    )
}