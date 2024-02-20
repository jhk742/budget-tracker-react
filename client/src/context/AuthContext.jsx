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

    useEffect(() => {
        const user = localStorage.getItem("User")
        setUser(JSON.parse(user))
    }, [])

    //for whenever the user provides input in one of the fields within the register-user form
    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info)
    }, [])

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

    return (
        <AuthContext.Provider 
            value={{
                user,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                setRegisterError
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


