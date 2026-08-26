import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { useEffect } from "react";
import { login,register,logout,getMe } from "../services/auth.api";


export const useAuth = () => {

    const context = useContext(AuthContext)
    const {user,setuser,loading,setloading} = context

    const handleLogin = async ({email,password}) =>{
        setloading(true)
        try
        {const data =  await login(email,password)

        setuser(data.user)}
        catch(err){
            console.log(err)
        }
        finally {setloading(false)}
    }

    const handleRegister = async({username,email,password})=>{
        setloading(true)
        try{const data = await register({username,email,password})
        setuser(data.user)}
        catch(err){}
        finally {setloading(false)}
    }
    const handleLogout = async()=>{
        setloading(true)
        const data = await logout()
        setuser(null)
        setloading(false)
    }

    useEffect(()=>{
        const getAndSetUser = async ()=>{
            try{
            const data = await getMe()
            setuser(data.user)
            setloading(false)}
            catch(err){console.log(err)}finally{
                setloading(false)
            }
        }

        getAndSetUser()
        },[])

    return {user,loading,handleLogin,handleLogout,handleRegister}
}