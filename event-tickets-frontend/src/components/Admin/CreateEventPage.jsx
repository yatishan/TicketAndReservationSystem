// src/components/CreateEventPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const CreateEventPage = ({ setCreatedEventId }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '', location: '', start_time: '', end_time: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        API.post('/admin/events', form).then(res => {
            alert(res.data.message);
            setCreatedEventId(res.data.event_id); 
            navigate('/admin/create-tier'); 
        }).catch(err => alert('အမှားအယွင်းရှိပါသည်။'));
    };

    return (
        <div className="card p-4 shadow-sm border-0 rounded-4">
            <h4 className="fw-bold text-dark mb-4">➕ ဖျော်ဖြေပွဲအသစ် ထည့်သွင်းရန်</h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-bold">ပွဲအမည်</label>
                    <input type="text" className="form-control" onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">ပွဲအကြောင်းအသေးစိတ်</label>
                    <input type="text" className="form-control" onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">📍 ကျင်းပမည့်နေရာ</label>
                    <input type="text" className="form-control" onChange={e => setForm({...form, location: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">⏰ စတင်မည့်အချိန်</label>
                    <input type="datetime-local" className="form-control" onChange={e => setForm({...form, start_time: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">🏁 ပြီးဆုံးမည့်အချိန်</label>
                    <input type="datetime-local" className="form-control" onChange={e => setForm({...form, end_time: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">ပွဲအသစ်သိမ်းဆည်းမည်</button>
            </form>
        </div>
    );
};

export default CreateEventPage;