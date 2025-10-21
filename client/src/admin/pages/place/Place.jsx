// Place.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Place = () => {
    /* ---------- state ---------- */
    const [placeName, setPlaceName] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [districts, setDistricts] = useState([]);
    const [places, setPlaces] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDist, setEditDist] = useState('');

    /* ---------- initial load ---------- */
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/district/').then(r => setDistricts(r.data.data));
        loadPlaces();
    }, []);

    const loadPlaces = () => {
        axios.get('http://127.0.0.1:8000/place/').then(r => setPlaces(r.data.data))
            .catch(console.error);

    }

    /* ---------- add / update ---------- */
    const handleSave = () => {
        if (!placeName && !editName) return;

        if (editId) {                                    // UPDATE
            axios.put(`http://127.0.0.1:8000/EditPlace/${editId}/`,
                { place_name: editName, district_id: editDist }
            )
                .then(res => {
                    setPlaces(res.data.data);
                    cancelEdit();
                })
                .catch(console.error);

        } else {                                         // CREATE

            axios.post('http://127.0.0.1:8000/place/', {
                place_name: placeName,
                district_id: districtId
            })
                .then(res => { setPlaces(res.data.data); setPlaceName(''); setDistrictId(''); })
                .catch(console.error);


        }
    };

    /* ---------- edit helpers ---------- */
    const startEdit = (p) => {
        setEditId(p.id); setEditName(p.place_name); setEditDist(p.district_id);

    };
    const cancelEdit = () => {
        setEditId(null); setEditName(''); setEditDist('');

    };

    /* ---------- delete ---------- */
    const handleDel = id => {
        axios.delete(`http://127.0.0.1:8000/DeletePlace/${id}/`)
            .then(res => setPlaces(res.data.data));
    }
    /* ---------- render ---------- */
    return (
        <div style={{ padding: 20 }}>
            <h3>{editId ? 'Edit place' : 'Add new place'}</h3>
            <table border="1" cellPadding="8">
                <thead><tr><th>District</th><th>Place</th><th>Action</th></tr></thead>
                <tbody>
                    <tr>
                        <td>
                            <select value={editId ? editDist : districtId}
                                onChange={e => editId ? setEditDist(e.target.value) : setDistrictId(e.target.value)}>
                                <option value="">-- select --</option>
                                {districts.map(d => <option key={d.id} value={d.id}>{d.district_name}</option>)}
                            </select>
                        </td>
                        <td>
                            <input placeholder="Enter place"
                                value={editId ? editName : placeName}
                                onChange={e => editId ? setEditName(e.target.value) : setPlaceName(e.target.value)} />
                        </td>
                        <td>
                            <button onClick={handleSave}>{editId ? 'Update' : 'Save'}</button>
                            {editId && <button onClick={cancelEdit} style={{ marginLeft: 4 }}>Cancel</button>}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h3>Existing places</h3>
            <table border="1" cellPadding="8">
                <thead><tr><th>Place</th><th>District</th><th>Actions</th></tr></thead>
                <tbody>
                    {places.map(p => (
                        <tr key={p.id}>
                            <td>{p.place_name}</td><td>{p.district_name}</td>
                            <td>
                                <button onClick={() => startEdit(p)}>Edit</button>
                                <button onClick={() => handleDel(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default Place;