import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Login() {

    const { loginError,
            isLoginLoading,
            loginUser,
            updateLoginInfo,
            setLoginError 
    } = useContext(AuthContext)

    const handleChange = (e) => {
        const { name, value} = e.target
        updateLoginInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="Login">
            <div className='login-box'>
                <form className="login-form" onSubmit={loginUser}>
                    <label className="login-form-title">
                            Login
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
                            className="btn-login-submit"
                        >
                                {isLoginLoading ? "Loggin you in" : "Login"}
                        </button>
                        {loginError?.error && (
                            <span className="login-error">
                                Warning: {loginError.message}
                                <button onClick={() => setLoginError(null)}>X</button>
                            </span>
                        )}
                </form>
            </div>
        </div>
    )
}