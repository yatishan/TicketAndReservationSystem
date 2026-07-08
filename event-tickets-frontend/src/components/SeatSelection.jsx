import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Echo from 'laravel-echo'; // 👈 ၁။ သီးသန့်သုံးရန် Import တိုးပေးပါမည်
import Pusher from 'pusher-js';   // 👈 ၂။ သီးသန့်သုံးရန် Import တိုးပေးပါမည်

const SeatSelection = ({ eventId, onBack, onProceedToPay }) => {
    const [eventData, setEventData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSeats = () => {
        API.get(`/event/${eventId}`)
            .then(response => {
                if (response.data.success) {
                    setEventData(response.data.data);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching seats:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSeats();
    }, [eventId]);

    useEffect(() => {
        window.Pusher = Pusher;
        const echo = new Echo({
            broadcaster: 'reverb', 
            key: 'your-websocket-key',
            wsHost: window.location.hostname,
            wsPort: 8080,
            forceTLS: false,
            disableStats: true,
        });

        echo.channel(`event.${eventId}`)
            .listen('.SeatStatusUpdated', (data) => {
                console.log("Real-time seats update ရပါပြီ- ", data);
                
                setEventData((prevData) => {
                    if (!prevData) return prevData;
                    
                    // 💡 ဒေတာအမျိုးအစား (String/Number) လွဲချော်မှုမရှိအောင် map(Number) လုပ်ထားပါမယ်
                    const targetSeatIds = Array.isArray(data.seatIds) ? data.seatIds.map(Number) : [];
                    
                    return {
                        ...prevData,
                        seats: prevData.seats.map((seat) => 
                            targetSeatIds.includes(Number(seat.id)) ? { ...seat, status: data.status } : seat
                        )
                    };
                });
            });

        return () => {
            echo.leaveChannel(`event.${eventId}`);
        };
    }, [eventId]);


    // 🔄 ၂။ 💡 [အဓိက အသက်သွေးကြောအသစ်] ခုံဒေတာ (eventData) ပြောင်းလဲသွားတိုင်း မိမိရွေးထားသောခုံနှင့် Amount ကို တိုက်ရိုက်ချိတ်ဆက်ပေးမည့်အပိုင်း
    useEffect(() => {
        if (!eventData || !eventData.seats) return;

        setSelectedSeats((prevSelected) => {
            // မိမိရွေးထားတဲ့ ခုံတွေထဲကမှ အခြားသူ ဦးမသွားသေးတဲ့ (available ဖြစ်နေဆဲ) ခုံတွေကိုပဲ ဇကာတင် ချန်ထားမယ်
            const validSeats = prevSelected.filter(id => {
                const seat = eventData.seats.find(s => Number(s.id) === Number(id));
                // ခုံရှိရမယ်၊ တင်မကဘဲ status က pending သို့မဟုတ် booked မဖြစ်နေရဘူး
                return seat && seat.status !== 'pending' && seat.status !== 'booked';
            });

            // အကယ်၍ မိမိခုံကို သူများဦးသွားလို့ ခုံအရေအတွက် လျော့သွားခဲ့ရင်
            if (validSeats.length !== prevSelected.length) {
                setTimeout(() => {
                    alert("⚠️ စိတ်မကောင်းပါဘူးဗျာ၊ သင်ရွေးချယ်ထားသော ခုံအချို့ကို အခြားသူတစ်ဦးက ဦးသွားသဖြင့် ဖယ်ထုတ်လိုက်ရပါသည်တန်။");
                }, 10);
            }

            return validSeats; // အားနေသေးတဲ့ ခုံအသစ်စာရင်းကိုပဲ ပြန်ပေးလိုက်မယ်
        });
    }, [eventData]);

    // ခုံတစ်ခုကို နှိပ်လိုက်တဲ့အခါ လုပ်ဆောင်မယ့် Logic
    const handleSeatClick = (seat) => {
        if (seat.status === 'booked' || seat.status === 'pending') return; 

        if (selectedSeats.includes(seat.id)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat.id]);
        }
    };

    // စုစုပေါင်း ကျသင့်ငွေကို တွက်ချက်ခြင်း
    const calculateTotal = () => {
        if (!eventData) return 0;
        return selectedSeats.reduce((total, seatId) => {
            const seat = eventData.seats.find(s => s.id === seatId);
            const tier = eventData.tiers.find(t => t.id === seat.tier_id);
            return total + parseFloat(tier.price);
        }, 0);
    };

    // "ခုံနေရာ ယာယီ Lock မည်" ခလုတ်နှိပ်သည့်အခါ
    const handleReserve = () => {
        if (selectedSeats.length === 0) {
            alert("ကျေးဇူးပြု၍ အနည်းဆုံး ခုံတစ်ခုံ ရွေးချယ်ပေးပါဦး။");
            return;
        }

        API.post('/bookings/reserve', {
            event_id: eventId,
            seat_ids: selectedSeats
        })
        .then(response => {
            if (response.data.success) {
                onProceedToPay(response.data.booking_id, response.data.total_price);
            }
        })
        .catch(error => {
            alert(error.response?.data?.message || "ခုံနေရာ ရယူခြင်း မအောင်မြင်ပါ။");
            fetchSeats(); 
        });
    };

    if (loading) return <div className="text-center my-5"><div className="spinner-border text-primary"></div></div>;

    if (!eventData) return <div className="container my-5 text-center"><h4>⚠️ ပွဲအချက်အလက်များ ရှာမတွေ့ပါ။ ဒေတာဘေ့စ်ကို စစ်ဆေးပေးပါ။</h4><button className="btn btn-primary mt-3" onClick={onBack}>နောက်သို့ ပြန်သွားမည်</button></div>;

    return (
        <div className="container my-5">
            <button className="btn btn-outline-secondary mb-4 btn-sm" onClick={onBack}>
                <i className="bi bi-arrow-left"></i> ပွဲစာရင်းသို့ ပြန်သွားမည်
            </button>

            <div className="row">
                {/* ဘယ်ဘက်အခြမ်း - ခုံမြေပုံ */}
                <div className="col-lg-8 mb-4">
                    <div className="card shadow-sm p-4 text-center">
                        <h4 className="fw-bold mb-4">{eventData.event.title}</h4>
                        
                        {/* Stage (စင်မြင့်ပုံစံ) */}
                        <div className="bg-dark text-white py-2 mb-5 rounded shadow-sm text-uppercase fw-bold small" style={{ letterSpacing: '2px' }}>
                            🎤 STAGE / စင်မြင့်
                        </div>

                        {/* ခုံများ ဖြန့်ခင်းပြပုံ */}
                        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                            {eventData.seats.map(seat => {
                                let btnClass = "btn-outline-success"; // Available
                                if (seat.status === 'booked') btnClass = "btn-danger text-white disabled";
                                else if (seat.status === 'pending') btnClass = "btn-warning text-dark disabled";
                                else if (selectedSeats.includes(seat.id)) btnClass = "btn-success text-white shadow";

                                return (
                                    <button
                                        key={seat.id}
                                        className={`btn ${btnClass} d-flex align-items-center justify-content-center fw-bold small p-0 rounded-3`}
                                        style={{ width: '45px', height: '45px', fontSize: '12px' }}
                                        onClick={() => handleSeatClick(seat)}
                                    >
                                        {seat.seat_number}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ခုံအရောင်ညွှန်းများ */}
                        <div className="d-flex justify-content-center gap-4 mt-3 small">
                            <div><span className="badge bg-outline-success border border-success me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span> အားသည်</div>
                            <div><span className="badge bg-success me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span> သင်ရွေးထားသည်</div>
                            <div><span className="badge bg-warning me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span> ယာယီ Lock မိနေသည်</div>
                            <div><span className="badge bg-danger me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span> ရောင်းပြီးသား</div>
                        </div>
                    </div>
                </div>

                {/* ညာဘက်အခြမ်း - ဝယ်ယူမှုအကျဉ်းချုပ် */}
                <div className="col-lg-4">
                    <div className="card shadow-sm p-4 bg-light border-0">
                        <h5 className="fw-bold mb-3">ဝယ်ယူမှု အကျဉ်းချုပ်</h5>
                        <hr />
                        <p className="d-flex justify-content-between">
                            <span>ရွေးချယ်ထားသော ခုံအရေအတွက်:</span>
                            <span className="fw-bold text-primary">{selectedSeats.length} ခုံ</span>
                        </p>
                        <h4 className="d-flex justify-content-between my-3 fw-bold">
                            <span>စုစုပေါင်း:</span>
                            <span className="text-success">{calculateTotal().toLocaleString()} MMK</span>
                        </h4>
                        <button 
                            className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                            disabled={selectedSeats.length === 0}
                            onClick={handleReserve}
                        >
                            ငွေချေစနစ်သို့ သွားမည်<i className="bi bi-credit-card-2-front-fill ms-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;