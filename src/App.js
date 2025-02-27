import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CryptoDashboard from "./CryptoDashboard";
import CryptoDetails from "./CryptoDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CryptoDashboard />} />
        <Route path="/crypto/:id" element={<CryptoDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
