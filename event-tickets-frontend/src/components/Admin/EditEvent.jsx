// src/components/EditEvent.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const EditEvent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    
    const event = location.state?.event;

    if (!event) {
        return <div className="alert alert-danger">⚠️ ပြင်ဆင်ရန် ပွဲစဉ်ဒေတာ လွှဲပြောင်းမှု မရှိပါဘဲ တိုက်ရိုက်ဝင်ရောက်၍ မရပါဗျာ။</div>;
    }

    const [form, setForm] = useState({
        title: event.title,
        description: event.description || '',
        location: event.location,
        // datetime-local input သဘာဝအရ 'YYYY-MM-DDTHH:MM' ပုံစံပြောင်းပေးရန် လိုအပ်သည်
        start_time: event.start_time ? event.start_time.replace(' ', 'T').substring(0, 16) : '',
        end_time: event.end_time ? event.end_time.replace(' ', 'T').substring(0, 16) : ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        API.put(`/admin/events/${event.id}`, form)
            .then(res => {
                alert(res.data.message);
                navigate('/admin/manage-events'); // အောင်မြင်ရင် စာရင်းစာမျက်နှာသို့ ပြန်သွားမည်
            })
            .catch(err => alert('ပြင်ဆင်ရာတွင် အမှားအယွင်းရှိပါသည်!'));
    };

    return (
        <div className="card p-4 shadow-sm border-0 rounded-4">
            <h4 className="fw-bold text-dark mb-4">📝 ပွဲစဉ်အချက်အလက် ပြင်ဆင်ရန်</h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-bold">ပွဲအမည်</label>
                    <input type="text" className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">ပွဲအကြောင်းအသေးစိတ်</label>
                    <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">📍 ကျင်းပမည့်နေရာ</label>
                    <input type="text" className="form-control" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">⏰ စတင်မည့်အချိန်</label>
                    <input type="datetime-local" className="form-control" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">🏁 ပြီးဆုံးမည့်အချိန်</label>
                    <input type="datetime-local" className="form-control" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning flex-fill py-2 fw-bold text-white">🔄 အချက်အလက်များ ပြောင်းလဲမည်</button>
                    <button type="button" className="btn btn-secondary px-4" onClick={() => navigate('/admin/manage-events')}>မလုပ်တော့ပါ</button>
                </div>
            </form>
        </div>
    );
};

export default EditEvent;