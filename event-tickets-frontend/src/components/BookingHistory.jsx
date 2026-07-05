import React, { useState, useEffect } from 'react';
import API from '../services/api';

const BookingHistory = ({ onBack }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Backend ရဲ့ /api/my-bookings ဆီကနေ ဒေတာလှမ်းတောင်းမယ်
        API.get('/my-bookings')
            .then(response => {
                setBookings(response.data.bookings);
                setLoading(false);
            })
            .catch(err => {
                setError('မှတ်တမ်းများ ဆွဲယူရာတွင် အမှားအယွင်းရှိနေပါသည်။');
                setLoading(false);
            });
    }, []);

    // Status အလိုက် အရောင် Badge လေးတွေ ခွဲပြမည့် Function
    const getStatusBadge = (status) => {
        switch (status) {
            case 'booked':
                return <span className="badge bg-success fw-bold">ဝယ်ယူမှုအောင်မြင်</span>;
            case 'pending':
                return <span className="badge bg-warning text-dark fw-bold">ငွေချေရန်စောင့်ဆိုင်း</span>;
            case 'cancelled':
                return <span className="badge bg-danger fw-bold">ဖျက်သိမ်းပြီး</span>;
            default:
                return <span className="badge bg-secondary fw-bold">{status}</span>;
        }
    };

    if (loading) return <div className="container my-5 text-center fw-bold text-secondary">မှတ်တမ်းများ ဆွဲယူနေပါသည် ခဏစောင့်ပါ...</div>;

    return (
        <div className="container my-4">
            {/* ခေါင်းစဉ်နှင့် ပြန်ထွက်ရန် ခလုတ် */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">📜 မိမိ၏ လက်မှတ်ဝယ်ယူမှု မှတ်တမ်းများ</h4>
                <button className="btn btn-outline-primary btn-sm fw-bold" onClick={onBack}>
                    🔙 ပင်မစာမျက်နှာသို့
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {bookings.length === 0 ? (
                <div className="card p-5 text-center border-0 shadow-sm bg-white rounded-3">
                    <p className="text-muted mb-0 fw-bold">ဝယ်ယူထားသော လက်မှတ်မှတ်တမ်းများ မရှိသေးပါဗျာ။</p>
                </div>
            ) : (
                <div className="row g-3">
                    {bookings.map((booking) => {
                        // ဒီ ဘွတ်ကင်ထဲမှာ ပါတဲ့ ခုံနံပါတ်တွေကို စာသားအနေနဲ့ ပေါင်းထုတ်မယ် (ဥပမာ - A1, A2)
                        const seatNames = booking.items.map(item => item.seat?.seat_number).join(', ');
                        // ပထမဆုံးခုံထဲကနေတစ်ဆင့် ပွဲအမည်ကို ယူမယ်
                        const eventName = booking.items[0]?.seat?.event?.title || 'Unknown Event';

                        return (
                            <div className="col-12" key={booking.id}>
                                <div className="card shadow-sm border-0 bg-white p-3 rounded-3">
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                        <div>
                                            <h5 className="fw-bold text-primary mb-1">{eventName}</h5>
                                            <p className="text-muted small mb-2">
                                                📅 ဝယ်ယူသည့်ရက်: {new Date(booking.created_at).toLocaleString('en-US', { hour12: true })}
                                            </p>
                                            <div className="d-flex gap-3 text-secondary small fw-bold">
                                                <span>🪑 ခုံနံပါတ်: <span className="text-dark">{seatNames}</span></span>
                                                <span>💵 စုစုပေါင်းကျသင့်ငွေ: <span className="text-dark">{Number(booking.total_price).toLocaleString()} MMK</span></span>
                                            </div>
                                        </div>
                                        <div>
                                            {getStatusBadge(booking.payment_status)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookingHistory;