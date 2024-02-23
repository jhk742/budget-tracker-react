import { createContext, useCallback, useState, useEffect } from 'react'
import { baseUrl, postRequest, patchRequest } from '../utils/services'

export const AuthContext = createContext() 

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [registerError, setRegisterError] = useState(null)
    const [isRegisterLoading, setIsRegisterLoading] = useState(false)
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: "",
        preferredCurrency: "",
        balance: ""
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
        setLoginInfo({
            email: "",
            password: ""
        })
    })

    const updateUserBalance = useCallback(async (updatedBalance) => {
        try {
            const updatedUserData = { ...user, balance: updatedBalance }
            const updateUserRes = await patchRequest(`${baseUrl}/users/updateUserBalance/${user._id}`, JSON.stringify({ balance: updatedBalance }));
    
            // Check if the update was successful
            if (!updateUserRes.error) {
                // Update user state
                setUser(updatedUserData);
                
                // Update localStorage
                localStorage.setItem("User", JSON.stringify(updatedUserData))
            } else {
                console.error("Error updating user balance", updateUserRes.message);
                // Handle error if needed
            }
        } catch (error) {
            console.error("Error updating user balance", error);
            // Handle error if needed
        }
    }, [user])

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
                setLoginError,
                updateUserBalance
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


