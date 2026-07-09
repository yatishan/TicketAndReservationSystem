import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../services/api';

const AdminScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // QR Scanner ကို ပုံသေကားချပ် သတ်မှတ်ခြင်း
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        // QR Code ဖတ်မိတဲ့အခါ အလုပ်လုပ်မည့်နေရာ
        scanner.render(
            async (decodedText) => {
                scanner.clear(); // တစ်ခါဖတ်ပြီးရင် ခေတ္တရပ်မည်
                handleVerifyTicket(decodedText);
            },
            (error) => {
                // ကင်မရာ ရှာဖွေနေစဉ် သို့မဟုတ် ဖတ်မရသေးစဉ် နောက်ကွယ်က error များကို console မထုတ်ဘဲ ထားနိုင်ပါသည်
            }
        );

        return () => scanner.clear();
    }, []);

    // Backend POST API သို့ လှမ်းစစ်ခိုင်းခြင်း
    const handleVerifyTicket = async (token) => {
        setLoading(true);
        setScanResult(token);
        setVerificationStatus(null);

        try {
            // 🎯 Request Data မပါဘဲ POST Method ဖြင့် လှမ်းခေါ်ခြင်း
            const response = await API.post(`/admin/verify-ticket/${token}`);
            setVerificationStatus({
                success: true,
                message: response.data.message,
                details: response.data.booking_details
            });
        } catch (err) {
            setVerificationStatus({
                success: false,
                message: err.response?.data?.message || "လက်မှတ်စစ်ဆေးခြင်း မအောင်မြင်ပါသဖြင့် ပြန်လည်စစ်ဆေးပါဦး။"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '600px' }}>
            <div className="card shadow border-0 p-4 bg-white">
                <h3 className="fw-bold text-center mb-4 text-primary">🛡️ Admin Ticket Scanner</h3>
                
                {/* ကင်မရာ ပြသမည့် နေရာ */}
                <div id="reader" className="w-100 rounded overflow-hidden shadow-sm mb-4"></div>

                {loading && (
                    <div className="text-center my-3 fw-bold text-muted">
                        🔄 လက်မှတ်အား စနစ်အတွင်း စစ်ဆေးနေပါသည်...
                    </div>
                )}

                {/* စစ်ဆေးမှု ရလဒ်များ ပြသခြင်း UI */}
                {verificationStatus && (
                    <div className={`alert ${verificationStatus.success ? 'alert-success' : 'alert-danger'} p-4 shadow-sm`}>
                        <h5 className="fw-bold mb-3">{verificationStatus.message}</h5>
                        
                        {verificationStatus.success && verificationStatus.details && (
                            <div className="small border-top pt-3 mt-2 text-dark">
                                <p className="mb-1"><strong>ပွဲအမည်:</strong> {verificationStatus.details.event_title}</p>
                                <p className="mb-1"><strong>ခုံနံပါတ်များ:</strong> {verificationStatus.details.seats.join(', ')}</p>
                                <p className="mb-0"><strong>ကျသင့်ငွေ:</strong> {verificationStatus.details.total_price.toLocaleString()} MMK</p>
                            </div>
                        )}

                        {/* Scanner ကို ပြန်ဖွင့်ပြီး နောက်တစ်ယောက် ထပ်ဖတ်ရန် ခလုတ် */}
                        <button 
                            className="btn btn-dark btn-sm w-100 fw-bold mt-3"
                            onClick={() => window.location.reload()}
                        >
                            🔄 နောက်ထပ် လက်မှတ်တစ်ခု ထပ်ဖတ်မည်
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminScanner;