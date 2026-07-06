import { useState,useEffect } from "react";
import API from "../../services/api";

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

export default CreateTierPage;