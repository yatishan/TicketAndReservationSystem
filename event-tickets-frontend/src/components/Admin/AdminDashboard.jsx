import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import CreateEventPage from './CreateEventPage';
import CreateTierPage from './CreateTierPage';

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
