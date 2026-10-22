import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import ReportLostPage from "./pages/ReportLostPage.jsx";
import ReportFoundPage from "./pages/ReportFoundPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import MyActivityPage from "./pages/MyActivityPage.jsx";
import Chatbot from "./components/Chatbot.jsx";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report/lost" element={<ReportLostPage />} />
        <Route path="/report/found" element={<ReportFoundPage />} />
        <Route path="/activity" element={<MyActivityPage />} />
        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
