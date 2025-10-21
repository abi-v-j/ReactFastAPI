import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import GuestRoutes from './GuestRoutes'
import UserRoutes from './UserRoutes'

const MainRoutes = () => {
  return (
   <Routes>
    <Route  path='*' element={<AdminRoutes/>}/>
    <Route  path='guest/*' element={<GuestRoutes/>}/>
    <Route  path='user/*' element={<UserRoutes/>}/>
   </Routes>
  )
}

export default MainRoutes