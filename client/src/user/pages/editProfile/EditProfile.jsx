// EditProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const nav = useNavigate();
    const uid = sessionStorage.getItem('uid');
    if (!uid) return null;

    /* ---------- state ---------- */
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [districts, setDistricts] = useState([]);
    const [places, setPlaces] = useState([]);
    const [districtId, setDistrictId] = useState('');
    const [placeId, setPlaceId] = useState('');

    /* 1. districts */
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/District/').then(r => setDistricts(r.data.data));
    }, []);

    /* 2. user + current selections */
    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/User/${uid}/`).then(res => {
            const u = res.data.data[0];
            setFullName(u.full_name);
            setEmail(u.email);
            setDistrictId(u.district_id); // key after clean()
            setPlaceId(u.place_id);         // key after clean()
        });
    }, [uid]);

    /* 3. places when district changes */
    useEffect(() => {
        if (!districtId) return;
        axios.get(`http://127.0.0.1:8000/Place/?district=${districtId}`)
            .then(r => setPlaces(r.data.data));
    }, [districtId]);

    /* 4. save */
    const handleSave = () => {
        const payload = {
            full_name: fullName,
            email,
            place_id: placeId
        };
        axios.put(`http://127.0.0.1:8000/UserUpdate/${uid}/`, payload,)
            .then(() => {
                alert('Profile updated');
            })
            .catch(() => alert('Update failed'));
    };

    /* 5. render */
    return (
        <div style={{ padding: 20 }}>
            <h3>Edit Profile</h3>
            <table border="1" cellPadding="8">
                <tbody>
                    <tr>
                        <td>Name</td>
                        <td><input value={fullName} onChange={e => setFullName(e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>District</td>
                        <td>
                            <select value={districtId} onChange={e => setDistrictId(e.target.value)}>
                                <option value="">-- select --</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.id}>{d.district_name}</option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Place</td>
                        <td>
                            <select value={placeId} onChange={e => setPlaceId(e.target.value)}>
                                <option value="">-- select --</option>
                                {places.map(p => (
                                    <option key={p.id} value={p.id}>{p.place_name}</option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" align="center">
                            <button onClick={handleSave}>Save</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default EditProfile;