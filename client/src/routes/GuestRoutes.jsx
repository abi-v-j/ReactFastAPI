import React from 'react'
import Registration from '../guest/pages/register/Registraion'
import { Route, Routes } from 'react-router-dom'
import Login from '../guest/pages/login/Login'

const GuestRoutes = () => {
    return (
        <Routes>
            <Route path='register' element={<Registration />} />
            <Route path='login' element={<Login />} />
        </Routes>)
}

export default GuestRoutes