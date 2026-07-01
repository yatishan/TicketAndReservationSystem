import React, { useState } from 'react';
import API from '../services/api';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Laravel ရဲ့ /api/register ဆီကို လှမ်းပို့မယ်
        API.post('/register', { name, email, password })
            .then(response => {
                setLoading(false);
                if (response.data.success) {
                    // 🎉 Auto-Login စနစ်: အကောင့်ဆောက်ပြီးတာနဲ့ Token နဲ့ User data ကို တန်းပေးပြီး ဝင်ခိုင်းလိုက်မယ်
                    onRegisterSuccess(response.data.access_token, response.data.user);
                }
            })
            .catch(err => {
                setLoading(false);
                // Validation Error တွေရှိရင် (ဥပမာ- အီးမေးလ်တူနေရင်) စာသားပြမယ်
                setError(err.response?.data?.message || 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။ ပြန်ကြိုးစားကြည့်ပါ။');
            });
    };

    return (
        <div className="container my-5" style={{ maxWidth: '450px' }}>
            <div className="card shadow border-0 p-4 bg-white rounded-3">
                <h3 className="fw-bold text-center mb-4 text-primary">🎫 TicketWave</h3>
                <h5 className="fw-bold text-dark mb-3">အကောင့်အသစ်ဖွင့်ရန်</h5>

                {error && <div className="alert alert-danger small py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">အမည် (Name)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="သင့်အမည် ရိုက်ထည့်ပါ"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">အီးမေးလ် (Email)</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-secondary">စကားဝှက် (Password - အနည်းဆုံး ၈ လုံး)</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-success w-100 py-2 fw-bold shadow-sm mb-3"
                        disabled={loading}
                    >
                        {loading ? 'အကောင့်ဆောက်နေပါသည်...' : 'အကောင့်သစ်ဖွင့်မည်'}
                    </button>

                    {/* Link to Login */}
                    <p className="text-center small text-muted mb-0">
                        အကောင့်ရှိပြီးသားလား?{' '}
                        <span 
                            className="text-primary fw-bold" 
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={onSwitchToLogin}
                        >
                            အကောင့်ဝင်ရန်
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;