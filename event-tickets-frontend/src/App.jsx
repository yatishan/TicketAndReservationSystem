import React, { useState, useEffect } from "react";
import EventList from "./components/EventList";
import SeatSelection from "./components/SeatSelection";
import PaymentForm from "./components/PaymentForm";
import Login from "./components/Login";
import Register from "./components/Register";
import API from "./services/api";
import BookingHistory from "./components/BookingHistory";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  // --- Auth States ---
  const [user, setUser] = useState(null); 
  const [authView, setAuthView] = useState("login"); 

  // --- Booking Flow States ---
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [currentView, setCurrentView] = useState("home"); // 'home', 'history', 'admin' 

  // App စဖွင့်ချင်းမှာ အရင်က Login ဝင်ထားတဲ့ Token ရှိမရှိ စစ်ဆေးမယ်
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // ⭐ Admin ဖြစ်ခဲ့ရင် currentView ကို 'admin' သို့ အော်တို ရွှေ့ပေးမယ်
      if (parsedUser.role === 'admin') {
        setCurrentView('admin');
      }

      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Login သို့မဟုတ် Register အောင်မြင်သွားတဲ့အခါ လုပ်ဆောင်မည့် လုပ်ဆောင်ချက်
  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // ⭐ Login ဝင်လိုက်သူက Admin ဖြစ်ပါက Admin view သို့ တန်းပို့မည်
    if (userData.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('home');
    }

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // အကောင့်ထဲက ထွက်ခြင်း (Logout)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthView("login");
    setCurrentView("home"); // ပြန် reset ချမယ်
    handleReset();
  };

  // အစကနေ ပြန်စမည့် လုပ်ဆောင်ချက် (Reset Flow)
  const handleReset = () => {
    setSelectedEventId(null);
    setBookingInfo(null);
    setIsPaid(false);
  };

  // Navbar Brand (TicketWave) ကို နှိပ်လျှင် Home သို့ ပြန်ပို့မည့် Function
  const handleBrandClick = () => {
    handleReset();
    if (user && user.role === 'admin') {
      setCurrentView('admin'); // Admin ဆိုရင် Admin Dashboard ပြန်ပြမယ်
    } else {
      setCurrentView('home');  // User ဆိုရင် Home ပြန်ပြမယ်
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
      {/* Navigation Bar */}
      <nav className="navbar navbar-dark bg-dark shadow mb-4">
        <div className="container">
          {/* ⭐ ပြင်ဆင်ရန်: handleBrandClick သို့ လွှဲပြောင်းလိုက်ပါသည် */}
          <span
            className="navbar-brand mb-0 h1 fw-bold"
            style={{ cursor: "pointer" }}
            onClick={handleBrandClick}
          >
            🎫 TicketWave
          </span>
          {user && (
            <div className="d-flex align-items-center gap-3">
              <span className="text-white small fw-bold">
                👋 ဟဲလို, {user.name}
              </span>
              
              {/* ⭐ သာမန် User ဖြစ်မှသာ "ကြည့်ခဲ့သောမှတ်တမ်းများ" ခလုတ်ကို ပြသမည် */}
              {user.role !== 'admin' && (
                <button
                  className="btn btn-outline-light btn-sm fw-bold me-1"
                  onClick={() => setCurrentView("history")}
                >
                  📜 ကြည့်ခဲ့သောမှတ်တမ်းများ
                </button>
              )}

              <button
                className="btn btn-outline-danger btn-sm fw-bold"
                onClick={handleLogout}
              >
                Logout ထွက်ရန်
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 🔐 အကယ်၍ User က Login မဝင်ရသေးရင် ပြသမည့် အပိုင်း */}
      {!user ? (
        authView === "login" ? (
          <Login
            onLoginSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthView("register")}
          />
        ) : (
          <Register
            onRegisterSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthView("login")}
          />
        )
      ) : (
        /* 🔓 Login ဝင်ပြီးသွားသော အပိုင်း */
        <>
          {/* ⭐ 👑 ဗဟို View Logic: currentView တန်ဖိုးပေါ်မူတည်၍ ခွဲခြားပြသခြင်း */}
          {currentView === "admin" && user.role === "admin" ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : currentView === "history" ? (
            <BookingHistory onBack={() => setCurrentView("home")} />
          ) : (
            /* ပုံမှန် လက်မှတ်ဝယ်ယူမည့် Home Flow အပိုင်း */
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

              {/* အဆင့် ၃ - Ngwe Chay System Form ပြခြင်း */}
              {bookingInfo && !isPaid && (
                <div className="container my-4 text-center">
                  <p className="text-secondary fw-bold">
                    ဝယ်ယူသူ: {user.email}
                  </p>
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
                  <div
                    className="card shadow-sm p-5 bg-white border-0"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                  >
                    <div className="text-success mb-3">
                      <i
                        className="bi bi-check-circle-fill"
                        style={{ fontSize: "4rem" }}
                      ></i>
                    </div>
                    <h2 className="fw-bold text-success mb-3">
                      ဝယ်ယူမှု အောင်မြင်ပါသည်၊ {user.name} ဗျာ!
                    </h2>
                    <p className="text-muted mb-4">
                      လက်မှတ်အသေးစိတ်ကို သင့်အီးမေးလ် <b>{user.email}</b>{" "}
                      ထံသို့ ပေးပို့ထားပါသည်။
                    </p>
                    <button
                      className="btn btn-primary px-4 py-2 fw-bold"
                      onClick={() => {
                        handleReset();
                        setCurrentView("home");
                      }}
                    >
                      ပင်မစာမျက်နှာသို့ ပြန်သွားမည်
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;