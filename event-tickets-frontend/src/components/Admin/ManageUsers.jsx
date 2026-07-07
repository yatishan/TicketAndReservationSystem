// src/components/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        setLoading(true);
        API.get('/admin/users')
            .then(res => {
                setUsers(res.data.users || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => { fetchUsers(); }, []);

    // User ကို Block / Unblock လုပ်သည့် Function
    const handleToggleStatus = (id, name, isActive) => {
        const actionText = isActive ? "ပိတ်ပင် (Block)" : "ပြန်ဖွင့် (Unblock)";
        if (window.confirm(`⚠️ "${name}" ၏ အကောင့်ကို တကယ်ပဲ ${actionText} မှာ သေချာပြီလားဗျာ?`)) {
            API.put(`/admin/users/${id}/toggle-status`)
                .then(res => {
                    alert(res.data.message);
                    fetchUsers(); // စာရင်းကို Update ပြန်လုပ်ရန်
                })
                .catch(err => alert('အဆင့်မြှင့်တင်ရာတွင် အမှားအယွင်းရှိပါသည်'));
        }
    };

    return (
        <div className="card p-4 shadow-sm border-0 rounded-4">
            <h4 className="fw-bold text-dark mb-4">👥 အသုံးပြုသူများ စီမံခန့်ခွဲခြင်း</h4>
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>စဉ်</th>
                                <th>အမည်</th>
                                <th>Email</th>
                                <th>အခြေအနေ (Status)</th>
                                <th>Register ရက်စွဲ</th>
                                <th>လုပ်ဆောင်ချက်</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td className="fw-bold">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {user.is_active ? (
                                                <span className="badge bg-success">Active</span>
                                            ) : (
                                                <span className="badge bg-danger">Blocked</span>
                                            )}
                                        </td>
                                        <td className="text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className={`btn btn-sm fw-bold ${user.is_active ? 'btn-outline-danger' : 'btn-success'}`}
                                                onClick={() => handleToggleStatus(user.id, user.name, user.is_active)}
                                            >
                                                {user.is_active ? '🔒 Block User' : '🔓 Unblock User'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center text-muted py-4">အသုံးပြုသူများ မရှိသေးပါဗျာ။</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;