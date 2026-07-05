import React, { useState } from 'react';
import API from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // ပွဲအသစ် ဖန်တီးမည့် Function
    const handleCreateEvent = (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        API.post('/admin/events', { title, date })
            .then(response => {
                setMessage('🎉 ပွဲအသစ်ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီဗျာ။');
                setTitle('');
                setDate('');
            })
            .catch(err => {
                setError(err.response?.data?.message || 'ပွဲဖန်တီးရာတွင် အမှားအယွင်းရှိနေပါသည်။');
            });
    };

    return (
        <div className="container my-5">
            {/* Header အပိုင်း */}
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bold text-dark">👑 Admin Dashboard</h2>
                    <p className="text-muted mb-0">မင်္ဂလာပါ Admin, <span className="text-primary fw-bold">{user.name}</span></p>
                </div>
                <button className="btn btn-danger fw-bold shadow-sm" onClick={onLogout}>
                    🔒 Logout ထွက်မည်
                </button>
            </div>

            {/* စာရင်းအင်းကတ်ပြားများ (Analytics Cards) */}
            <div className="row g-4 mb-5">
                <div class="col-md-4">
                    <div className="card bg-primary text-white border-0 shadow-sm p-4 rounded-4">
                        <h6 className="fw-bold text-white-50">💵 စုစုပေါင်း ရောင်းရငွေ</h6>
                        <h3 className="fw-bold mb-0">1,450,000 MMK</h3>
                    </div>
                </div>
                <div class="col-md-4">
                    <div className="card bg-success text-white border-0 shadow-sm p-4 rounded-4">
                        <h6 className="fw-bold text-white-50">🎫 ရောင်းချပြီး လက်မှတ်မှတ်တမ်း</h6>
                        <h3 className="fw-bold mb-0">၄၂ စောင်</h3>
                    </div>
                </div>
                <div class="col-md-4">
                    <div className="card bg-dark text-white border-0 shadow-sm p-4 rounded-4">
                        <h6 className="fw-bold text-white-50">🎤 လက်ရှိကျင်းပမည့်ပွဲများ</h6>
                        <h3 className="fw-bold mb-0">၅ ပွဲ</h3>
                    </div>
                </div>
            </div>

            {/* ပွဲအသစ် ဖန်တီးမည့် Form အပိုင်း */}
            <div className="row">
                <div class="col-lg-6">
                    <div className="card shadow-sm border-0 p-4 bg-white rounded-4">
                        <h4 className="fw-bold text-dark mb-4">➕ ဖျော်ဖြေပွဲအသစ် ထည့်သွင်းရန်</h4>
                        
                        {message && <div className="alert alert-success fw-bold">{message}</div>}
                        {error && <div className="alert alert-danger fw-bold">{error}</div>}

                        <form onSubmit={handleCreateEvent}>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">ပွဲအမည် (Event Title)</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg bg-light" 
                                    placeholder="ဥပမာ - Rock Alive Concert 2026"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary">ကျင်းပမည့်ရက်စွဲ (Event Date)</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control form-control-lg bg-light"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm">
                                🚀 ပွဲလမ်းသဘင်အသစ်ကို အသက်သွင်းမည်
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;