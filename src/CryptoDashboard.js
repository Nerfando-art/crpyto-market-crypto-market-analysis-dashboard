import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Card({ children, darkMode }) {
  return (
    <div className={`border p-4 rounded-lg shadow-md transition-all duration-300 
      ${darkMode
        ? "bg-[#1e1e1e] text-[#e0e0e0] border-[#333] shadow-lg shadow-gray-900/20"
        : "bg-white text-black border-gray-300 shadow-md"
      }`}>
      {children}
    </div>
  );
}

const darkThemeClasses = "bg-[#141414] text-[#e0e0e0] transition-colors duration-300";
const lightThemeClasses = "bg-gray-100 text-black transition-colors duration-300";

export default function CryptoDashboard() {
  const [filteredData, setFilteredData] = useState([]);
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [globalStats, setGlobalStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 10;

  // search state
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = searchTerm
    ? filteredData
        .filter((coin) =>
          coin.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10)
    : [];

  const [darkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const currency = "usd";

  // Fetch data
  useEffect(() => {
    const fetchAll = () => {
      fetchCryptoData();
      fetchGlobalStats();
    };
    fetchAll();
    const interval = setInterval(fetchCryptoData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const fetchCryptoData = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
      );
      const data = await res.json();
      setFilteredData(data);
    } catch (err) {
      console.error("Error fetching crypto data:", err);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/global");
      const json = await res.json();
      setGlobalStats(json.data);
    } catch (err) {
      console.error("Error fetching global stats:", err);
    }
  };

  const toggleFavorite = (coinId) => {
    let updated = [...favorites];
    if (updated.includes(coinId)) {
      updated = updated.filter((id) => id !== coinId);
    } else {
      updated.push(coinId);
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const currentData = filteredData.slice(
    (currentPage - 1) * coinsPerPage,
    currentPage * coinsPerPage
  );

  return (
    <div className={`${darkMode ? darkThemeClasses : lightThemeClasses} min-h-screen p-6`}>
      {/* Global Market Stats */}
      {globalStats && (
        <div className="bg-gray-900 p-4 rounded-lg text-center text-white mb-6">
          <h2 className="text-xl font-bold">🌎 Global Crypto Market</h2>
          <p>Total Market Cap: ${globalStats.total_market_cap.usd.toLocaleString()}</p>
          <p>BTC Dominance: {globalStats.market_cap_percentage.btc.toFixed(2)}%</p>
          <p>24h Volume: ${globalStats.total_volume.usd.toLocaleString()}</p>
        </div>
      )}

      {/* Navigation + Search Bar */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        {/* Placeholder nav buttons */}
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Page 1</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Page 2</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Page 3</button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cryptos..."
            className={`w-full p-2 rounded border ${
              darkMode 
                ? "bg-[#1e1e1e] border-[#333] placeholder-gray-500" 
                : "bg-white border-gray-300 placeholder-gray-400"
            }`}
          />
          {searchResults.length > 0 && (
            <ul className={`absolute right-0 mt-1 w-full max-h-60 overflow-y-auto rounded shadow-lg z-10
              ${darkMode ? "bg-[#1e1e1e]" : "bg-white"}`}>
              {searchResults.map((coin) => (
                <li key={coin.id} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <Link
                    to={`/crypto/${encodeURIComponent(coin.id)}`}
                    className="block"
                    onClick={() => setSearchTerm("")}
                  >
                    {coin.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top 10 by Market Cap */}
      <div className="bg-[#1e1e1e] p-4 rounded-lg text-white mb-6">
        <h2 className="text-lg font-bold">🏆 Top 10 Cryptos by Market Cap</h2>
        <div className="flex space-x-4 overflow-x-auto mt-2">
          {filteredData.slice(0, 10).map((coin) => (
            <Link to={`/crypto/${encodeURIComponent(coin.id)}`} key={coin.id}>
              <div className="p-3 min-w-[120px] bg-[#222] rounded-md text-center">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 mx-auto mb-1"
                />
                <p className="text-sm font-semibold">{coin.name}</p>
                <p className="text-xs text-gray-400">#{coin.market_cap_rank}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      {currentData.length === 0 ? (
        <p className="text-center text-gray-400 my-8">
          ⚠ No cryptocurrencies available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentData.map((crypto) => (
            <Link to={`/crypto/${encodeURIComponent(crypto.id)}`} key={crypto.id}>
              <Card darkMode={darkMode}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(crypto.id);
                  }}
                  className="absolute top-2 right-2 text-yellow-400 text-2xl"
                >
                  {favorites.includes(crypto.id) ? "⭐" : "☆"}
                </button>
                <div className="p-4">
                  <h2 className="text-xl font-bold">{crypto.name}</h2>
                  <p>${crypto.current_price.toLocaleString()}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            ◀ Previous
          </button>
          <span className="text-lg">
            {currentPage} / {Math.ceil(filteredData.length / coinsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= Math.ceil(filteredData.length / coinsPerPage)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
