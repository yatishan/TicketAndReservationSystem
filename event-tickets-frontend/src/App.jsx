import React, { useState } from 'react';
import EventList from './components/EventList';
import SeatSelection from './components/SeatSelection';
import PaymentForm from './components/PaymentForm';

function App() {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null); 
  const [isPaid, setIsPaid] = useState(false); 

  
  const handleProceedToPay = (bookingId, totalPrice) => {
    setBookingInfo({ bookingId, totalPrice });
  };

 
  const handlePaymentSuccess = () => {
    setIsPaid(true);
  };

  
  const handleReset = () => {
  setSelectedEventId(null);
  setBookingInfo(null); 
  setIsPaid(false);
};

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar navbar-dark bg-dark shadow mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1 fw-bold">🎫 TicketWave</span>
        </div>
      </nav>

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
        <PaymentForm 
          bookingId={bookingInfo.bookingId}
          totalPrice={bookingInfo.totalPrice}
          onSuccess={handlePaymentSuccess}
          onCancel={handleReset}
        />
      )}

      {/* အဆင့် ၄ - ဝယ်ယူမှု အောင်မြင်ကြောင်း Success Page ပြခြင်း */}
      {isPaid && (
        <div className="container text-center my-5 py-5">
          <div className="card shadow-sm p-5 bg-white border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="text-success mb-3">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="fw-bold text-success mb-3">ဝယ်ယူမှု အောင်မြင်ပါသည်ဗျာ!</h2>
            <p className="text-muted mb-4">
              သင့်ရဲ့ လက်မှတ်များကို စနစ်တကျ အော်ဒါတင်ပြီးပါပြီ။ <br />
            </p>
            <button className="btn btn-primary px-4 py-2 fw-bold" onClick={handleReset}>
              ပင်မစာမျက်နှာသို့ ပြန်သွားမည်
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;