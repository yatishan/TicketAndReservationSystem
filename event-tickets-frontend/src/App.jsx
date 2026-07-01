import React, { useState, useEffect } from 'react';
import EventList from './components/EventList';
import SeatSelection from './components/SeatSelection';
import PaymentForm from './components/PaymentForm';
import Login from './components/Login';
import Register from './components/Register';
import API from './services/api';

function App() {
  // --- Auth States ---
  const [user, setUser] = useState(null); // Login ဝင်ထားသော User သိမ်းရန်
  const [authView, setAuthView] = useState('login'); // 'login' သို့မဟုတ် 'register' ပြရန်

  // --- Booking Flow States ---
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  // App စဖွင့်ချင်းမှာ အရင်က Login ဝင်ထားတဲ့ Token ရှိမရှိ စစ်ဆေးမယ်
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Axios Instance မှာ Token ကို Header အဖြစ် သတ်မှတ်ပေးလိုက်မယ်
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Login သို့မဟုတ် Register အောင်မြင်သွားတဲ့အခါ လုပ်ဆောင်မည့် လုပ်ဆောင်ချက်
  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // နောက်ပိုင်းပို့မယ့် API တိုင်းမှာ Token အော်တိုပါသွားအောင် လုပ်မယ်
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // အကောင့်ထဲက ထွက်ခြင်း (Logout)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthView('login');
    handleReset();
  };

  // အစကနေ ပြန်စမည့် လုပ်ဆောင်ချက် (Reset Flow)
  const handleReset = () => {
    setSelectedEventId(null);
    setBookingInfo(null);
    setIsPaid(false);
  };

  const handleProceedToPay = (bookingId, totalPrice) => {
    setBookingInfo({ bookingId, totalPrice });
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar navbar-dark bg-dark shadow mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1 fw-bold" style={{ cursor: 'pointer' }} onClick={handleReset}>
            🎫 TicketWave
          </span>
          {user && (
            <div className="d-flex align-items-center gap-3">
              <span className="text-white small fw-bold">👋 ဟဲလို, {user.name}</span>
              <button className="btn btn-outline-danger btn-sm fw-bold" onClick={handleLogout}>
                Logout ထွက်ရန်
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 🔐 အကယ်၍ User က Login မဝင်ရသေးရင် ပြသမည့် အပိုင်း */}
      {!user ? (
        authView === 'login' ? (
          <Login 
            onLoginSuccess={handleAuthSuccess} 
            onSwitchToRegister={() => setAuthView('register')} 
          />
        ) : (
          <Register 
            onRegisterSuccess={handleAuthSuccess} 
            onSwitchToLogin={() => setAuthView('login')} 
          />
        )
      ) : (
        /* 🔓 Login ဝင်ပြီးသွားမှ ပေးကြည့်မည့် လက်မှတ်ဝယ်ယူခြင်း Flow အပိုင်း */
        <>
          {/* အဆင့် ၁ - ပွဲလမ်းသဘင်များ စာရင်းပြခြင်း */}
          {!selectedEventId && !bookingInfo && !isPaid && (
            <EventList onSelectEvent={(id) => setSelectedEventId(id)} />
          )}

          {/* အဆင့် ၂ - ခုံနေရာရွေးချယ်ခြင်း စာမျက်နှာပြခြင်း */}
          {selectedEventId && !bookingInfo && !isPaid && (
            <SeatSelection 
              eventId={selectedEventId} 
              onBack={() => setSelectedEventId(null)}
              onProceedToPay={handleProceedToPay}
            />
          )}

          {/* အဆင့် ၃ - ငွေချေစနစ် Form ပြခြင်း */}
          {bookingInfo && !isPaid && (
            <div className="container my-4 text-center">
              <p className="text-secondary fw-bold">ဝယ်ယူသူ: {user.email}</p>
              <PaymentForm 
                bookingId={bookingInfo.bookingId}
                totalPrice={bookingInfo.totalPrice}
                onSuccess={handlePaymentSuccess}
                onCancel={handleReset}
              />
            </div>
          )}

          {/* အဆင့် ၄ - ဝယ်ယူမှု အောင်မြင်ကြောင်း Success Page ပြခြင်း */}
          {isPaid && (
            <div className="container text-center my-5 py-5">
              <div className="card shadow-sm p-5 bg-white border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="text-success mb-3">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="fw-bold text-success mb-3">ဝယ်ယူမှု အောင်မြင်ပါသည်၊ {user.name} ဗျာ!</h2>
                <p className="text-muted mb-4">
                  သင့်ရဲ့ လက်မှတ်များကို စနစ်တကျ အော်ဒါတင်ပြီးပါပြီ။ <br />
                  လက်မှတ်အသေးစိတ်ကို သင့်အီးမေးလ် <b>{user.email}</b> ထံသို့ ပေးပို့ထားပါသည်။
                </p>
                <button className="btn btn-primary px-4 py-2 fw-bold" onClick={handleReset}>
                  ပင်မစာမျက်နှာသို့ ပြန်သွားမည်
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;