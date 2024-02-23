import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { supportedCurrencies } from '../utils/currencies'

export default function Register() {

    const { updateRegisterInfo,
            registerUser,
            registerError,
            isRegisterLoading, 
            setRegisterError } = useContext(AuthContext)

    const handleChange = (e) => {
        const { name, value } = e.target
        updateRegisterInfo(prev => ({
            ...prev,
            [name]: value
        })) 
    }

    const currenciesList = supportedCurrencies.map((currency, index) => {
        const { code, name } = currency
        return (
            <option
                key={index}
                value={`${code} - ${name}`}
            >{`${code} - ${name}`}</option>
        )
    })

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
                            placeholder="John Doe"
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input 
                            type="email"
                            name="email"
                            placeholder="johnDoe123@gmail.com"
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
                    <label>
                        Preferred Currency:
                        <select 
                            id="preferredCurrency"
                            name="preferredCurrency"
                            onChange={handleChange}
                        >
                            <option value="">--- Select Currency ---</option>
                            {currenciesList}
                        </select>
                    </label>
                    <label>
                        Initial Balance:
                        <input
                            type="number"
                            name="balance"
                            placeholder="1545.75"
                            onChange={handleChange}
                            step="0.01"
                        ></input>
                    </label>
                    <button 
                        type="submit" 
                        className="btn-register-submit"
                    >
                            {isRegisterLoading ? "Creating your account" : "Register"}
                    </button>
                    {registerError?.error && (
                        <span className="register-error">
                            Warning: {registerError.message}
                            <button onClick={() => setRegisterError(null)}>X</button>
                        </span>
                    )}
                </form>
            </div>
        </div>
    )
}