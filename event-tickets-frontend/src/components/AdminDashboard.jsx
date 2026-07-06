import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import API from "../services/api";

// 📝 Component (၁) - ပွဲဆောက်သည့် စာမျက်နှာ
const CreateEventPage = ({ setCreatedEventId }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    API.post("/admin/events", form)
      .then((res) => {
        alert(res.data.message);
        setCreatedEventId(res.data.event_id);
        navigate("/admin/create-tier");
      })
      .catch((err) => alert("အမှားအယွင်းရှိပါသည်။"));
  };

  return (
    <div className="card p-4 shadow-sm border-0 rounded-4">
      <h4 className="fw-bold text-dark mb-4">
        ➕ ဖျော်ဖြေပွဲအသစ် ထည့်သွင်းရန်
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">ပွဲအမည်</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">ပွဲအကြောင်းအသေးစိတ်</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">📍 ကျင်းပမည့်နေရာ</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">⏰ စတင်မည့်အချိန်</label>
          <input
            type="datetime-local"
            className="form-control"
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">🏁 ပြီးဆုံးမည့်အချိန်</label>
          <input
            type="datetime-local"
            className="form-control"
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
          ပွဲအသစ်သိမ်းဆည်းမည်
        </button>
      </form>
    </div>
  );
};

// 📝 Component (၂) - ခုံအမျိုးအစား သီးသန့်ဆောက်သည့် စာမျက်နှာ
// 📝 AdminDashboard.jsx ထဲက CreateTierPage Component တစ်ခုတည်းကိုပဲ ဒီကုဒ်နဲ့ အစားထိုးပေးပါဦးဗျာ
const CreateTierPage = ({ eventId }) => {
  const [events, setEvents] = useState([]); // အမြဲတမ်း Array အဖြစ် အရင်ထားမယ်
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [count, setCount] = useState("");
  const [loading, setLoading] = useState(true); // ⏳ Loading ပြရန်

  // ၁။ ပွဲစဉ်များကို ဆွဲယူခြင်း
  useEffect(() => {
        setLoading(true);
        API.get('/events') 
            .then(res => {
                const eventData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setEvents(eventData);
                console.log(eventData);
                setLoading(false);
            })
            .catch(err => {
                console.error('ပွဲစဉ်စာရင်း ဆွဲယူရာတွင် အမှားအယွင်းရှိပါသည်', err);
                setEvents([]); 
                setLoading(false);
            });
    }, []);

  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [eventId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEventId)
      return alert(
        "ကျေးဇူးပြု၍ ခုံနေရာ သတ်မှတ်မည့် ပွဲစဉ်ကို အရင်ရွေးချယ်ပေးပါဗျာ။",
      );

    API.post("/admin/tiers", { event_id: selectedEventId, name, price, count })
      .then((res) => {
        alert(res.data.message);
        setName("");
        setPrice("");
        setCount("");
      })
      .catch((err) => alert("Tier ဆောက်ရာတွင် အမှားအယွင်းရှိပါသည်။"));
  };

  return (
    <div className="card p-4 shadow-sm border-0 rounded-4">
      <h4 className="fw-bold text-dark mb-4">
        🪑 ခုံအမျိုးအစားနှင့် အရေအတွက် သတ်သတ်ဆောက်ရန်
      </h4>

      <form onSubmit={handleSubmit}>
        {/* 🎯 Event Selection Dropdown */}
        <div className="mb-4">
          <label className="form-label fw-bold text-primary">
            📅 မည်သည့် ပွဲစဉ်အတွက် ခုံဆောက်မည်နည်း။
          </label>
          <select
            className="form-select form-select-lg"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            required
            disabled={loading} // Loading ဖြစ်နေရင် ခလုတ်ပိတ်ထားမယ်
          >
            {loading ? (
              <option>🔄 ပွဲစဉ်များကို ဆွဲယူနေပါသည်...</option>
            ) : (
              <>
                <option value="">
                  -- ကျေးဇူးပြု၍ ပွဲစဉ်တစ်ခု ရွေးချယ်ပါ --
                </option>
                {/* ⭐ အကာအကွယ်: events က array ဖြစ်မှသာ .map ပတ်ခိုင်းမယ် */}
                {Array.isArray(events) &&
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({event.location})
                    </option>
                  ))}
              </>
            )}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Tier Name (ဥပမာ- VIP, Normal)
          </label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">
            💵 လက်မှတ်စျေးနှုန်း (Price)
          </label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">
            🔢 ခုံအရေအတွက် (Seat Count)
          </label>
          <input
            type="number"
            className="form-control"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-sm"
          disabled={loading}
        >
          🚀 ဤပွဲအတွက် ခုံအမျိုးအစားအသစ် ဖန်တီးမည်
        </button>
      </form>
    </div>
  );
};
// Main Admin Dashboard Layout
const AdminDashboard = ({ user, onLogout }) => {
  const [createdEventId, setCreatedEventId] = useState(null);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* 📂 Left Sidebar Navigations */}
        <div className="col-md-3 bg-dark min-vh-100 p-4 shadow text-white">
          <h4 className="fw-bold text-primary mb-4">🎫 TicketWave Admin</h4>
          <p className="small text-white-50">မင်္ဂလာပါ, {user.name}</p>
          <hr />
          <ul className="nav flex-column gap-2 fw-bold">
            <li className="nav-item">
              <Link
                to="/admin"
                className="text-white text-decoration-none py-2 d-block"
              >
                📊 Dashboard Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/create-event"
                className="text-white text-decoration-none py-2 d-block"
              >
                ➕ ပွဲအသစ်ဆောက်ရန်
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/create-tier"
                className="text-white text-decoration-none py-2 d-block"
              >
                🪑 ခုံအမျိုးအစားဆောက်ရန်
              </Link>
            </li>
          </ul>
          <button
            className="btn btn-danger w-100 fw-bold mt-5 rounded-3"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        {/* 🖥️ Right Content Area */}
        <div className="col-md-9 p-5 bg-light">
          {/* 🔀 Sub-Routes ခွဲခြင်း (html tag အဟောင်းကို ဖယ်ရှားလိုက်ပါပြီ) */}
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h2 className="fw-bold text-dark mb-4">
                    Dashboard Analytics Overview
                  </h2>
                  <p>
                    ဒီနေရာတွင် စာရင်းဇယားများနှင့် ရောင်းအားများကို
                    ပြသပေးသွားမည်ဖြစ်ပါသည်။ Sidebar မှတစ်ဆင့်
                    လုပ်ဆောင်ချက်များကို ရွေးချယ်နိုင်ပါတယ်ဗျာ။
                  </p>
                </div>
              }
            />
            <Route
              path="create-event"
              element={
                <CreateEventPage setCreatedEventId={setCreatedEventId} />
              }
            />
            <Route
              path="create-tier"
              element={<CreateTierPage eventId={createdEventId} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
