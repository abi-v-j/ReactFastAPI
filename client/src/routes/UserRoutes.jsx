import React from 'react'
import HomePage from '../user/home/HomePage'
import { Route, Routes } from 'react-router-dom'
import MyProfile from '../user/pages/myProfile/MyProfile'
import EditProfile from '../user/pages/editProfile/EditProfile'
import ChangePassword from '../user/pages/changePassword/ChangePassword'

const UserRoutes = () => {
    return (
        <Routes>
            <Route path='home' element={<HomePage />} />
            <Route path='myprofile' element={<MyProfile />} />
            <Route path='editprofile' element={<EditProfile />} />
            <Route path='changepassword' element={<ChangePassword />} />
        </Routes>
    )
}

export default UserRoutes