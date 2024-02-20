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

    //for whenever the user provides input in one of the fields within the register-user form
    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info)
    }, [])

    const registerUser = useCallback(async (e) => {
        e.preventDefault()
        console.log("HOWDY")
    })

    return (
        <AuthContext.Provider 
            value={{
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


