import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from '../admin/dashboard/Dashboard'
import District from '../admin/pages/district/District'
import Place from '../admin/pages/place/Place'

const AdminRoutes = () => {
  return (
   <Routes>
    <Route  path='' element={<Dashboard/>}/>
    <Route  path='district' element={<District/>}/>
    <Route  path='place' element={<Place/>}/>
   </Routes>
  )
}

export default AdminRoutes