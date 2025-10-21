// MyProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const uid = sessionStorage.getItem('uid');
        if (!uid) return;

        axios.get(`http://127.0.0.1:8000/User/${uid}/`)
            .then(res => setProfile(res.data.data[0]))
            .catch(err => console.error(err));
    }, []);

    if (!profile) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h3>My Profile</h3>
            <table border="1" cellPadding="8">
                <tbody>
                     <tr>
                        <td>Photo</td>
                        <td>
                            <img src={`http://127.0.0.1:8000/${profile.photo}`} alt="user" width="120"/>
                        </td>
                    </tr>
                    <tr><td>Name</td><td>{profile.full_name}</td></tr>
                    <tr><td>Email</td><td>{profile.email}</td></tr>
                    <tr><td>District</td><td>{profile.district_name}</td></tr>
                    <tr><td>Place</td><td>{profile.place_name}</td></tr>
                   
                </tbody>
            </table>
        </div>
    );
};

export default MyProfile;