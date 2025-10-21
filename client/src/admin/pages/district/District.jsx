import axios from 'axios';
import React, { useEffect, useState } from 'react';

const District = () => {
  const [value, setValue] = useState('');
  const [districts, setDistricts] = useState([]);
  const [editId, setEditId] = useState(null);   // ← NEW
  const [editName, setEditName] = useState('');   // ← NEW

  useEffect(() => loadDistricts(), []);

  const loadDistricts = () =>
    axios.get('http://127.0.0.1:8000/district/')
      .then(res => {
        console.log(res.data);

        setDistricts(res.data.data)
      })
      .catch(console.error);

  /* ---------- ADD / UPDATE ---------- */
  const handleSave = () => {
    if (editId) {                                        // UPDATE mode
      axios.put(`http://127.0.0.1:8000/district/${editId}/`,
        { name: editName })
        .then(res => {
          setDistricts(res.data.data);
          cancelEdit();                             // reset form
        })
        .catch(console.error);
    } else {                                              // CREATE mode

      axios.post('http://127.0.0.1:8000/district/', { name: value })
        .then(res => {
          setDistricts(res.data.data);
          setValue('');
        })
        .catch(console.error);
    }
  };

  /* ---------- EDIT (load into input) ---------- */
  const startEdit = (d) => {
    setEditId(d.id);
    setEditName(d.district_name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  /* ---------- DELETE ---------- */
  const handleDelete = id =>
    axios.delete(`http://127.0.0.1:8000/district/${id}/`)
      .then(res => setDistricts(res.data.data))
      .catch(console.error);

  /* ---------- RENDER ---------- */
  return (
    <div>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>District</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              {editId ? (
                <input
                  placeholder="Edit district"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              ) : (
                <input
                  placeholder="Enter district"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              )}
            </td>
            <td>
              <button onClick={handleSave}>
                {editId ? 'Update' : 'Save'}
              </button>
              {editId && (
                <button onClick={cancelEdit} style={{ marginLeft: 4 }}>
                  Cancel
                </button>
              )}
            </td>
          </tr>
        </tbody>

        {districts.map(d => (
          <tbody key={d.id}>
            <tr>
              <td>{d.district_name}</td>
              <td>
                <button onClick={() => startEdit(d)}>Edit</button>
                <button onClick={() => handleDelete(d.id)}>Delete</button>
              </td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
};

export default District;