import React, { useState, useEffect } from "react";
import API from "../../services/api";

const ViewSales = () => {
  const [salesData, setSalesData] = useState({
    total_revenue: 0,
    total_tickets_sold: 0,
    bookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("admin/sales")
      .then((res) => {
        setSalesData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div>
      <h4 className="fw-bold text-dark mb-4">
        📊 လက်မှတ်ရောင်းရမှုနှင့် စာရင်းဇယား
      </h4>

      {/* 📈 Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card p-4 bg-primary text-white border-0 rounded-4 shadow-sm">
            <small className="text-white-50 fw-bold">
              စုစုပေါင်း ရောင်းရငွေ
            </small>
            <h2 className="fw-black mt-2">
              {Number(salesData.total_revenue).toLocaleString()} MMK
            </h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-4 bg-success text-white border-0 rounded-4 shadow-sm">
            <small className="text-white-50 fw-bold">
              ရောင်းရပြီး လက်မှတ်စောင်ရေ
            </small>
            <h2 className="fw-black mt-2">
              {salesData.total_tickets_sold} စောင်
            </h2>
          </div>
        </div>
      </div>

      {/* 📋 Bookings Table */}
      <div className="card p-4 shadow-sm border-0 rounded-4">
        <h5 className="fw-bold mb-3">🎫 မကြာသေးမီက ဝယ်ယူမှုများ</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Booking ID</th>
                <th>ဝယ်သူအမည်</th>
                <th>ပွဲအမည်</th>
                <th>ရွေးချယ်ခဲ့သည့် ခုံများ</th>
                <th>ကျသင့်ငွေ</th>
                <th>ဝယ်ယူသည့်ရက်စွဲ</th>
              </tr>
            </thead>
            <tbody>
              {salesData.bookings.length > 0 ? (
                salesData.bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="text-primary fw-bold">#{booking.id}</td>
                    <td>
                      <div className="fw-bold">{booking.user?.name}</div>
                      <small className="text-muted">
                        {booking.user?.email}
                      </small>
                    </td>
                    <td className="fw-bold">{booking.event?.title}</td>
                    <td>
                      {booking.items?.map(
                        (item) =>
                          item.seat && (
                            <span
                              key={item.id}
                              className="badge bg-info text-dark me-1 mb-1"
                            >
                              {item.seat.seat_number}
                            </span>
                          ),
                      )}
                    </td>
                    <td className="fw-bold text-success">
                      {Number(booking.total_price).toLocaleString()} MMK
                    </td>
                    <td className="text-muted">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    လက်မှတ်ဝယ်ယူထားသည့် စာရင်းမရှိသေးပါဗျာ။
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewSales;
