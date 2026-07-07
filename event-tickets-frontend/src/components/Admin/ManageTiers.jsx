// src/components/ManageTiers.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageTiers = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // ပြင်နေတဲ့ Tier ID ကိုမှတ်ရန်
    const [editForm, setEditForm] = useState({ name: '', price: '', capacity: '' });

    const fetchTiers = () => {
        setLoading(true);
        API.get('/admin/tiers')
            .then(res => {
                setTiers(res.data.tiers || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => { fetchTiers(); }, []);

    // Inline Edit စတင်ရန် ခလုတ်နှိပ်ခြင်း
    const startEdit = (tier) => {
        setEditingId(tier.id);
        setEditForm({ name: tier.name, price: tier.price, capacity: tier.seats.length });
    };

    // ပြင်ဆင်ထားသည်များကို သိမ်းဆည်းခြင်း
    const handleUpdate = (id) => {
        API.put(`/admin/tiers/${id}`, editForm)
            .then(res => {
                alert(res.data.message);
                setEditingId(null);
                fetchTiers();
            })
            .catch(err => alert('ပြင်ဆင်ရာတွင် အမှားအယွင်းရှိပါသည်'));
    };

    // Tier ဖျက်ခြင်း
    const handleDelete = (id, name) => {
        if (window.confirm(`⚠️ "${name}" ခုံအမျိုးအစားကို တကယ်ဖျက်မှာ သေချာပြီလားဗျာ?`)) {
            API.delete(`/admin/tiers/${id}`)
                .then(res => {
                    alert(res.data.message);
                    fetchTiers();
                })
                .catch(err => alert('ဖျက်ရာတွင် အမှားအယွင်းရှိပါသည်'));
        }
    };

    return (
        <div className="card p-4 shadow-sm border-0 rounded-4">
            <h4 className="fw-bold text-dark mb-4">🪑 ခုံအမျိုးအစားများနှင့် ဈေးနှုန်းများ စီမံရန်</h4>
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ပွဲအမည်</th>
                                <th>ခုံအမျိုးအစား</th>
                                <th>လက်မှတ်ဈေးနှုန်း</th>
                                <th>ခုံအရေအတွက်</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.length > 0 ? (
                                tiers.map(tier => (
                                    <tr key={tier.id}>
                                        <td className="fw-bold text-secondary">{tier.event?.title || 'Unknown Event'}</td>
                                        <td>
                                            {editingId === tier.id ? (
                                                <input type="text" className="form-control form-control-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                            ) : (tier.name)}
                                        </td>
                                        <td>
                                            {editingId === tier.id ? (
                                                <input type="number" className="form-control form-control-sm" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                                            ) : (`${Number(tier.price).toLocaleString()} MMK`)}
                                        </td>
                                        <td>
                                            {editingId === tier.id ? (
                                                <input type="number" className="form-control form-control-sm" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: e.target.value})} />
                                            ) : (tier.seats.length)}
                                        </td>
                                        <td>
                                            {editingId === tier.id ? (
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-sm btn-success fw-bold" onClick={() => handleUpdate(tier.id)}>💾 သိမ်းမည်</button>
                                                    <button className="btn btn-sm btn-secondary fw-bold" onClick={() => setEditingId(null)}>ပယ်ဖျက်</button>
                                                </div>
                                            ) : (
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-warning fw-bold text-white" onClick={() => startEdit(tier)}>📝 ပြင်မည်</button>
                                                    <button className="btn btn-sm btn-danger fw-bold" onClick={() => handleDelete(tier.id, tier.name)}>🗑️ ဖျက်မည်</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center text-muted py-4">ခုံအမျိုးအစားများ မရှိသေးပါဗျာ။</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageTiers;