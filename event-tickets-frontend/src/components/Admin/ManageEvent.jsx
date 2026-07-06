// src/components/ManageEvents.jsx
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from 'react-router-dom';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ပွဲစဉ်များ ဆွဲယူခြင်း
  const fetchEvents = () => {
    setLoading(true);
    API.get("/events")
      .then((res) => {
        const eventData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setEvents(eventData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ပွဲစဉ် ဖျက်ခြင်း
  const handleDelete = (id, title) => {
    if (window.confirm(`⚠️ "${title}" ပွဲစဉ်ကို တကယ်ဖျက်မှာ သေချာပြီလားဗျာ?`)) {
      API.delete(`/admin/events/${id}`)
        .then((res) => {
          alert(res.data.message);
          fetchEvents(); // ဖျက်ပြီးရင် ဇယားကို Refresh ပြန်လုပ်မည်
        })
        .catch((err) => alert("ဖျက်ရာတွင် အမှားအယွင်းရှိပါသည်!"));
    }
  };

  return (
    <div className="card p-4 shadow-sm border-0 rounded-4">
      <h4 className="fw-bold text-dark mb-4">
        ⚙️ ပွဲစဉ်များ စီမံခန့်ခွဲရန် (Manage Events)
      </h4>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">ဒေတာများ ဆွဲယူနေပါသည်...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>ပွဲအမည်</th>
                <th>နေရာ</th>
                <th>စတင်မည့်အချိန်</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{event.title}</td>
                    <td>{event.location}</td>
                    <td>{new Date(event.start_time).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning fw-bold text-white"
                        onClick={() => {
                          const id = event.id || event.event_id; // id သို့မဟုတ် event_id ပါရင် ယူမယ်
                          navigate(`/admin/edit-event/${id}`, {
                            state: { event },
                          });
                        }}
                      >
                        📝 ပြင်ဆင်မည်
                      </button>
                      <button
                        className="btn btn-sm btn-danger fw-bold"
                        onClick={() => handleDelete(event.id, event.title)}
                      >
                        🗑️ ဖျက်မည်
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    လက်ရှိတွင် ဖန်တီးထားသော ပွဲစဉ်များ မရှိသေးပါဗျာ။
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
