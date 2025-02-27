import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

function Card({ children, darkMode }) {
  return (
    <div className={`border p-4 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return <div className="p-2">{children}</div>;
}

function Button({ children, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 ${className} rounded-md hover:scale-105 transition-transform`}
    >
      {children}
    </button>
  );
}

const API_BASE = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=";

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("market_cap_desc");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [currency, setCurrency] = useState("usd");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, [currency]);

  useEffect(() => {
    filterAndSortData();
  }, [searchQuery, cryptoData, sortOption]);

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`);
      const data = await response.json();
      setCryptoData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortData = () => {
    let filtered = cryptoData.filter((crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorters = {
      price_asc: (a, b) => a.current_price - b.current_price,
      price_desc: (a, b) => b.current_price - a.current_price,
      market_cap_asc: (a, b) => a.market_cap - b.market_cap,
      market_cap_desc: (a, b) => b.market_cap - a.market_cap,
    };

    filtered.sort(sorters[sortOption]);
    setFilteredData(filtered);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-6`}>
      <div className="flex justify-between mb-4">
        <Button onClick={() => setDarkMode((prev) => {
          localStorage.setItem("darkMode", !prev);
          return !prev;
        })} className={`${darkMode ? "bg-yellow-400 text-black" : "bg-gray-700 text-white"}`}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </Button>

        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="p-2 border rounded-md">
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="gbp">GBP</option>
        </select>

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded-md">
          <option value="market_cap_desc">Market Cap: High to Low</option>
          <option value="market_cap_asc">Market Cap: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="price_asc">Price: Low to High</option>
        </select>

        <Button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="bg-gray-500 text-white">
          {viewMode === "grid" ? "📋 List View" : "🔳 Grid View"}
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-3 gap-4" : "flex flex-col"}>
          {filteredData.map((crypto) => (
            <Link to={`/crypto/${crypto.id}`} key={crypto.id}>
              <Card darkMode={darkMode}>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{crypto.name}</h2>
                    <motion.span className="text-green-500" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                      ${crypto.current_price.toLocaleString()}
                    </motion.span>
                  </div>
                  <p className="text-sm text-gray-500">Market Cap: ${crypto.market_cap.toLocaleString()}</p>
                  <span className={`text-lg ${crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {crypto.price_change_percentage_24h >= 0 ? "🔺" : "🔻"} {crypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                  {crypto.sparkline_in_7d && (
                    <LineChart width={250} height={100} data={crypto.sparkline_in_7d.price.map((price, index) => ({ index, price }))}>
                      <XAxis dataKey="index" hide />
                      <YAxis hide />
                      <Tooltip />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
