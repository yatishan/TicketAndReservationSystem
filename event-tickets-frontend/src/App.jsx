import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"; // ← ⭐ Router Hooks များ သုံးပါမည်
import EventList from "./components/EventList";
import SeatSelection from "./components/SeatSelection";
import PaymentForm from "./components/PaymentForm";
import Login from "./components/Login";
import Register from "./components/Register";
import API from "./services/api";
import BookingHistory from "./components/BookingHistory";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Auth States ---
  const [user, setUser] = useState(null); 
  const [authView, setAuthView] = useState("login"); 

  // --- Booking Flow States ---
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [currentView, setCurrentView] = useState("home"); 

  // App စဖွင့်ချင်းမှာ အရင်က Login ဝင်ထားတဲ့ Token ရှိမရှိ စစ်ဆေးမယ်
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 👑 အကယ်၍ Admin ဖြစ်ပြီး /admin လမ်းကြောင်းထဲ ရောက်မနေရင် /admin သို့ ပို့ပေးမယ်
      if (parsedUser.role === 'admin' && !location.pathname.startsWith('/admin')) {
        navigate('/admin');
      }
    }
  }, []);

  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    if (userData.role === 'admin') {
      navigate('/admin'); // Admin ဆိုလျှင် /admin URL သို့ တန်းမောင်းနှင်မည်
    } else {
      setCurrentView('home');
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthView("login");
    setCurrentView("home");
    handleReset();
    navigate('/');
  };

  const handleReset = () => {
    setSelectedEventId(null);
    setBookingInfo(null);
    setIsPaid(false);
  };

  const handleBrandClick = () => {
    handleReset();
    if (user && user.role === 'admin') {
      navigate('/admin');
    } else {
      setCurrentView('home');
      navigate('/');
    }
  };

  const handleProceedToPay = (bookingId, totalPrice) => {
    setBookingInfo({ bookingId, totalPrice });
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
  };

  return (
    <div>
      {/* 🌐 Navigation Bar (Admin URL ရောက်နေရင် ၎င်းအလိုအလျောက် ပုန်းနေပါလိမ့်မယ်) */}
      {!location.pathname.startsWith('/admin') && (
        <nav className="navbar navbar-dark bg-dark shadow mb-4">
          <div className="container">
            <span
              className="navbar-brand mb-0 h1 fw-bold"
              style={{ cursor: "pointer" }}
              onClick={handleBrandClick}
            >
              🎫 TicketWave
            </span>
            {user && (
              <div className="d-flex align-items-center gap-3">
                <span className="text-white small fw-bold">👋 ဟဲလို, {user.name}</span>
                {user.role !== 'admin' && (
                  <button
                    className="btn btn-outline-light btn-sm fw-bold me-1"
                    onClick={() => setCurrentView("history")}
                  >
                    📜 ကြည့်ခဲ့သောမှတ်တမ်းများ
                  </button>
                )}
                <button className="btn btn-outline-danger btn-sm fw-bold" onClick={handleLogout}>
                  Logout ထွက်ရန်
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* 🔀 ဗဟိုချက်မ Routes ခွဲခြားခြင်း စနစ် */}
      <Routes>
        {/* 👑 Admin Route (URL က /admin ဖြင့် စတင်သမျှအားလုံးကို AdminDashboard ဆီ လွှဲပေးလိုက်သည်) */}
        <Route path="/admin/*" element={
          user && user.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <div className="container text-center my-5"><h3>🛑 ဝင်ရောက်ခွင့်မရှိပါ</h3></div>
          )
        } />

        {/* 🧑‍🤝‍🧑 ပုံမှန် User နှင့် ဧည့်သည်များအတွက် Main Route */}
        <Route path="*" element={
          !user ? (
            authView === "login" ? (
              <Login onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthView("register")} />
            ) : (
              <Register onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthView("login")} />
            )
          ) : (
            <>
              {currentView === "history" ? (
                <BookingHistory onBack={() => setCurrentView("home")} />
              ) : (
                <>
                  {/* အဆင့် ၁ - ပွဲလမ်းသဘင်များ စာရင်းပြခြင်း */}
                  {!selectedEventId && !bookingInfo && !isPaid && (
                    <EventList onSelectEvent={(id) => setSelectedEventId(id)} />
                  )}

                  {/* အဆင့် ၂ - ခုံနေရာရွေးချယ်ခြင်း စာမျက်နှာပြခြင်း */}
                  {selectedEventId && !bookingInfo && !isPaid && (
                    <SeatSelection eventId={selectedEventId} onBack={() => setSelectedEventId(null)} onProceedToPay={handleProceedToPay} />
                  )}

                  {/* အဆင့် ၃ - Ngwe Chay System Form ပြခြင်း */}
                  {bookingInfo && !isPaid && (
                    <div className="container my-4 text-center">
                      <p className="text-secondary fw-bold">ဝယ်ယူသူ: {user.email}</p>
                      <PaymentForm bookingId={bookingInfo.bookingId} totalPrice={bookingInfo.totalPrice} onSuccess={handlePaymentSuccess} onCancel={handleReset} />
                    </div>
                  )}

                  {/* အဆင့် ၄ - ဝယ်ယူမှု အောင်မြင်ကြောင်း Success Page ပြခြင်း */}
                  {isPaid && (
                    <div className="container text-center my-5 py-5">
                      <div className="card shadow-sm p-5 bg-white border-0" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="text-success mb-3"><i className="bi bi-check-circle-fill" style={{ fontSize: "4rem" }}></i></div>
                        <h2 className="fw-bold text-success mb-3">ဝယ်ယူမှု အောင်မြင်ပါသည်၊ {user.name} ဗျာ!</h2>
                        <p className="text-muted mb-4">လက်မှတ်အသေးစိတ်ကို သင့်အီးမေးလ် <b>{user.email}</b> ထံသို့ ပေးပို့ထားပါသည်။</p>
                        <button className="btn btn-primary px-4 py-2 fw-bold" onClick={() => { handleReset(); setCurrentView("home"); }}>ပင်မစာမျက်နှာသို့ ပြန်သွားမည်</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )
        } />
      </Routes>
    </div>
  );
}

export default App;