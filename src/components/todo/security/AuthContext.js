import { createContext, useContext, useState } from "react";
import { apiClient } from "../api/ApiClient";
import { executeJwtAuthenticationService, executeDeleteAccount, executeRegister } from "../api/AuthenticationApiService";

//1: Create a Context
export const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const useAuthenticated = () => {
    return useAuth().isAuthenticated
}

export const useUsername = () => {
    return useAuth().username
}
//2: Share the created context with other components
export default function AuthProvider({ children }) {

    //3: Put some state in the context
    const [isAuthenticated, setAuthenticated] = useState(false)

    const [username, setUsername] = useState(null)

    const [token, setToken] = useState(null)

    // function login(username, password) {
    //     if(username==='adhikrit' && password==='dummy'){
    //         setAuthenticated(true)
    //         setUsername(username)
    //         return true            
    //     } else {
    //         setAuthenticated(false)
    //         setUsername(null)
    //         return false
    //     }          
    // }

    // async function login(username, password) {

    //     const baToken = 'Basic ' + window.btoa( username + ":" + password )

    //     try {

    //         const response = await executeBasicAuthenticationService(baToken)

    //         if(response.status==200){
    //             setAuthenticated(true)
    //             setUsername(username)
    //             setToken(baToken)

    //             apiClient.interceptors.request.use(
    //                 (config) => {
    //                     console.log('intercepting and adding a token')
    //                     config.headers.Authorization = baToken
    //                     return config
    //                 }
    //             )

    //             return true            
    //         } else {
    //             logout()
    //             return false
    //         }    
    //     } catch(error) {
    //         logout()
    //         return false
    //     }
    // }


    async function login(username, password) {

        try {

            const response = await executeJwtAuthenticationService(username, password, token)

            if(response.status==200){
                
                const jwtToken = 'Bearer ' + response.data.token
                
                setAuthenticated(true)
                setUsername(username)
                setToken(jwtToken)

                apiClient.interceptors.request.use(
                    (config) => {
                        console.log('intercepting and adding a token')
                        config.headers.Authorization = jwtToken
                        return config
                    }
                )

                return true            
            } else {
                logout()
                return false
            }    
        } catch(error) {
            logout()
            return false
        }
    }

    async function register(username, password) {
        try {
            const response = await executeRegister(username, password);
            if (response.status === 200) {
                return await login(username, password);
            } else {
                console.error('Failed to register user');
                return false;
            }
        } catch (error) {
            console.error('Error registering user:', error);
            return false;
        }
    }

    async function deleteAccount(password) {
        if (!token || !username) {
            console.error('User is not authenticated or username is missing');
            return false;
        }
    
        // const password = prompt('Please enter your password to confirm account deletion:', '');
        if (!password) {
            console.error('Password is required to delete the account');
            return false;
        }
    
        try {
            const response = await executeDeleteAccount(username, password);
    
            if (response.status === 200) {
                console.log('Account deleted successfully');
                logout(); // Clear authentication state after account deletion
                return true;
            } else {
                console.error('Failed to delete account');
                return false;
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            return false;
        }
    }
    

    function logout() {
        setAuthenticated(false)
        setToken(null)
        setUsername(null)
    }

    return (
        <AuthContext.Provider value={ {isAuthenticated, login, logout, deleteAccount,register , username, token}  }>
            {children}
        </AuthContext.Provider>
    )
} 