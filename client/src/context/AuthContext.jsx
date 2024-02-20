import { createContext, useCallback, useState, useEffect } from 'react'
import { baseUrl, postRequest } from '../utils/services'

export const AuthContext = createContext() 

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [registerError, setRegisterError] = useState(null)
    const [isRegisterLoading, setIsRegisterLoading] = useState(false)
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: ""
    })

    const [loginError, setLoginError] = useState(null)
    const [isLoginLoading, setIsLoginLoading] = useState(false)
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: ""
    })

    useEffect(() => {
        const user = localStorage.getItem("User")
        setUser(JSON.parse(user))
    }, [])

    //for whenever the user provides input in one of the fields within the register-user form
    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info)
    }, [])

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info)
    })

    const registerUser = useCallback(async (e) => {
        e.preventDefault()
        setIsRegisterLoading(true)
        setRegisterError(null)
        const res = await postRequest(`${baseUrl}/users/register`, JSON.stringify(registerInfo))
        setIsRegisterLoading(false)

        if (res.error) {
            return setRegisterError(res)
        }

        localStorage.setItem("User", JSON.stringify(res))
        setUser(res)
    }, [registerInfo])

    const loginUser = useCallback(async (e) => {
        e.preventDefault()
        setIsLoginLoading(true)
        setLoginError(null)
        const res = await postRequest(`${baseUrl}/users/login`, JSON.stringify(loginInfo))
        setIsLoginLoading(false)
        if(res.error) {
            return setLoginError(res)
        }

        localStorage.setItem("User", JSON.stringify(res))
        setUser(res)
    }, [loginInfo])

    const logoutUser = useCallback(() => {
        localStorage.removeItem("User")
        setUser(null)
    })

    return (
        <AuthContext.Provider 
            value={{
                user,
                updateRegisterInfo,
                updateLoginInfo,
                registerUser,
                loginUser,
                logoutUser,
                registerError,
                loginError,
                isRegisterLoading,
                isLoginLoading,
                setRegisterError,
                setLoginError
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


