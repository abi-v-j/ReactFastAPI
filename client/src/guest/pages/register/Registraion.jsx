// Registration.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Registration = () => {
    /* ---------- state ---------- */
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [places, setPlaces] = useState([]);
    const [districtId, setDistrictId] = useState('');
    const [placeId, setPlaceId] = useState('');

    /* ---------- load districts ---------- */
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/District/').then(r => setDistricts(r.data.data));
    }, []);

    /* ---------- load places when district changes ---------- */
    useEffect(() => {
        if (!districtId) {
            setPlaces([]); setPlaceId('');
            return;

        }
        axios.get(`http://127.0.0.1:8000/Place/?district=${districtId}`)
            .then(r => setPlaces(r.data.data));
    }, [districtId]);

    /* ---------- submit ---------- */
    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('photo', photo);
        formData.append('place_id', placeId);   // backend receives only place id

        axios.post('http://127.0.0.1:8000/Register/', formData)
            .then(() => alert('User registered'))
            .catch(console.error);
    };

    /* ---------- render ---------- */
    return (
        <div style={{ padding: 20 }}>
            <h3>Registration</h3>
            <table border="1" cellPadding="8">
                <tbody>
                    <tr>
                        <td>Full Name</td>
                        <td><input value={fullName} onChange={e => setFullName(e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Password</td>
                        <td><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Photo</td>
                        <td><input type="file" onChange={e => setPhoto(e.target.files[0])} /></td>
                    </tr>
                    <tr>
                        <td>District</td>
                        <td>
                            <select value={districtId} onChange={e => setDistrictId(e.target.value)}>
                                <option value="">-- select --</option>
                                {districts.map(d => <option key={d.id} value={d.id}>{d.district_name}</option>)}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Place</td>
                        <td>
                            <select value={placeId} onChange={e => setPlaceId(e.target.value)} disabled={!districtId}>
                                <option value="">-- select --</option>
                                {places.map(p => <option key={p.id} value={p.id}>{p.place_name}</option>)}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" align="center">
                            <button onClick={handleSubmit}>Register</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Registration;