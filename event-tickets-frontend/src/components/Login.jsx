import React, { useState } from 'react';
import API from '../services/api';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        API.post('/login', { email, password })
            .then(response => {
                setLoading(false);
                if (response.data.success) {
                    onLoginSuccess(response.data.access_token, response.data.user);
                }
            })
            .catch(err => {
                setLoading(false);
                setError(err.response?.data?.message || 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။');
            });
    };

    return (
        <div className="container my-5" style={{ maxWidth: '450px' }}>
            <div className="card shadow border-0 p-4 bg-white rounded-3">
                <h3 className="fw-bold text-center mb-4 text-primary">🎫 TicketWave</h3>
                <h5 className="fw-bold text-dark mb-3">အကောင့်သို့ ဝင်ရန်</h5>

                {error && <div className="alert alert-danger small py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                        <label className="form-label small fw-bold text-secondary">စကားဝှက် (Password)</label>
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
                        className="btn btn-primary w-100 py-2 fw-bold shadow-sm mb-3"
                        disabled={loading}
                    >
                        {loading ? 'ခဏစောင့်ပါ...' : 'Log In ဝင်မည်'}
                    </button>

                    {/* Link to Register */}
                    <p className="text-center small text-muted mb-0">
                        အကောင့်မရှိသေးဘူးလား?{' '}
                        <span 
                            className="text-primary fw-bold" 
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={onSwitchToRegister}
                        >
                            အကောင့်သစ်ဖွင့်ရန်
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;