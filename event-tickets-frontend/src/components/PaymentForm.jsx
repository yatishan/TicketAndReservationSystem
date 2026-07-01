import React, { useState } from 'react';
import API from '../services/api';

const PaymentForm = ({ bookingId, totalPrice, onSuccess, onCancel }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Backend ဆီကို ကတ်အချက်အလက်တွေ လှမ်းပို့မယ်
        API.post(`/bookings/${bookingId}/confirm`, {
            card_number: cardNumber,
            expiry: expiry,
            cvv: cvv
        })
        .then(response => {
            setLoading(false);
            if (response.data.success) {
                // အောင်မြင်ရင် အောင်မြင်ကြောင်း UI ကို လှမ်းပြောမယ်
                onSuccess();
            }
        })
        .catch(err => {
            setLoading(false);
            // ၁၀ မိနစ် ကျော်သွားရင်ဖြစ်ဖြစ်၊ Error တက်ရင်ဖြစ်ဖြစ် စာသားပြမယ်
            setError(err.response?.data?.message || "ငွေချေမှု မအောင်မြင်ပါ။ ပြန်ကြိုးစားကြည့်ပါ။");
        });
    };

    const handleCancelBooking = () => {
    setLoading(true);
    API.post(`/bookings/${bookingId}/cancel`)
        .then(() => {
            setLoading(false);
            onCancel(); 
        })
        .catch(() => {
            setLoading(false);
            onCancel();
        });
    };

    return (
        <div className="container my-5" style={{ maxWidth: '500px' }}>
            <div className="card shadow-sm border-0 p-4 bg-light">
                <h4 className="fw-bold mb-3 text-center text-dark">💳 ငွေချေစနစ် (Mock Payment)</h4>
                <p className="text-muted text-center small mb-4">
                    သင့်ခုံနေရာများကို ၁၀ မိနစ် ယာယီ Lock ပေးထားပါသည်။ ကျေးဇူးပြု၍ သတ်မှတ်ချိန်အတွင်း ငွေချေမှုကို အပြီးသတ်ပေးပါ။
                </p>

                <div className="alert alert-info text-center fw-bold mb-4">
                    ကျသင့်ငွေစုစုပေါင်း: {totalPrice.toLocaleString()} MMK
                </div>

                {error && <div className="alert alert-danger small">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* ကတ်နံပါတ် */}
                    <div className="mb-3">
                        <label className="form-label small fw-bold">ကတ်နံပါတ် (၁၆ လုံး)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="1234 5678 1234 5678"
                            maxLength="16"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="row">
                        {/* သက်တမ်းကုန်မည့်ရက် */}
                        <div className="col-6 mb-3">
                            <label className="form-label small fw-bold">သက်တမ်းကုန်ရက်</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="MM/YY"
                                maxLength="5"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                required 
                            />
                        </div>
                        {/* CVV */}
                        <div className="col-6 mb-3">
                            <label className="form-label small fw-bold">CVV</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="123"
                                maxLength="3"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {/* ခလုတ်များ */}
                    <button 
                        type="submit" 
                        className="btn btn-success w-100 py-2 fw-bold mb-2 shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'လုပ်ဆောင်နေပါသည်...' : 'ဝယ်ယူမှု အတည်ပြုမည်'}
                    </button>
                    
                    <button 
                        type="button" 
                        className="btn btn-outline-secondary w-100 py-2 fw-bold btn-sm"
                        onClick={handleCancelBooking}
                        disabled={loading}
                    >
                        မဝယ်တော့ပါ (ဖျက်သိမ်းမည်)
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;