import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// 👇 ၁။ ရောက်ရှိလာမည့် BrowserRouter ကို အပေါ်နားမှာ Import အရင်ဆွဲပါမယ်
import { BrowserRouter } from 'react-router-dom'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 👇 ၂။ <App /> ကို <BrowserRouter> ဖြင့် သေသေချာချာ ပတ်ပေးလိုက်ပါပြီ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)