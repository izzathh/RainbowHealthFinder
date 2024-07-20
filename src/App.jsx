import { Reports } from "./components/adminreports";
import { Main } from "./components/main";
import { AdminLogin } from "./components/adminLogin";
import './assets/css/ui.css';
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />}></Route>
        <Route path="/admin-login" element={<AdminLogin />}></Route>
        <Route path="/survey-reports" element={<Reports />}></Route>
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
