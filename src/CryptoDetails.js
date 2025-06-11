import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

const RANGE_OPTIONS = {
  "1D": "1",
  "7D": "7",
  "30D": "30",
  "6M": "180",
  "1Y": "365",
  "ALL": "max",
};

export default function CryptoDetails() {
  const { id: rawId } = useParams();
  const id = decodeURIComponent(rawId);  // 👈 Handle encoded IDs like 'usd-coin'
  const [crypto, setCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState("30D");
  const [yAxisDomain, setYAxisDomain] = useState(["auto", "auto"]);
  const [error, setError] = useState(null);

  console.log("Decoded coin ID:", id); // ✅ Log what's being used

  useEffect(() => {
    if (!id) {
      setError("Missing coin ID.");
      return;
    }

    fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
      .then((res) => {
        console.log("Coin fetch status:", res.status);  // ✅ Log status
        if (!res.ok) throw new Error("Failed to load coin info");
        return res.json();
      })
      .then((data) => {
        console.log("Coin details loaded:", data);
        setCrypto(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Coin fetch error:", err);
        setError("Unable to load coin data.");
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const days = RANGE_OPTIONS[chartRange];
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
      .then((res) => res.json())
      .then((data) => {
        const useHourly = days === "1" || days === "7";
        const prices = data.prices.map(([timestamp, price]) => ({
          date: useHourly
            ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date(timestamp).toLocaleDateString(),
          price: Number(price.toFixed(4)),
        }));

        const values = prices.map(p => p.price);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const buffer = range === 0 ? min * 0.05 : range * 0.1;

        const roundedMin = min - buffer;
        const roundedMax = max + buffer;

        setChartData(prices);
        setYAxisDomain([roundedMin, roundedMax]);
      })
      .catch(err => {
        console.error("Chart data error:", err);
        setChartData([]);
      });
  }, [id, chartRange]);

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!crypto) return <p className="text-center mt-10 text-gray-500">Loading crypto details...</p>;

  const { market_data, description } = crypto;

  return (
    <main className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg" aria-labelledby="crypto-heading">
      <Link
        to="/"
        className="inline-block mb-4 text-blue-600 hover:underline focus:outline-none focus:ring focus:ring-blue-300"
      >
        ← Back to Home
      </Link>

      <header>
        <h1 id="crypto-heading" className="text-3xl font-bold mb-2">
          {crypto.name} ({crypto.symbol.toUpperCase()})
        </h1>
        <p className="text-gray-600 mb-4">
          {description?.en?.slice(0, 200) || "No description available."}
        </p>
      </header>

      <section aria-labelledby="market-data-heading" className="mb-8">
        <h2 id="market-data-heading" className="text-xl font-semibold mb-2">Market Data</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
          <div><strong>Current Price:</strong> ${market_data.current_price.usd.toLocaleString()}</div>
          <div><strong>Market Cap:</strong> ${market_data.market_cap.usd.toLocaleString()}</div>
          <div><strong>24h High:</strong> ${market_data.high_24h.usd.toLocaleString()}</div>
          <div><strong>24h Low:</strong> ${market_data.low_24h.usd.toLocaleString()}</div>
          <div><strong>Circulating Supply:</strong> {market_data.circulating_supply.toLocaleString()}</div>
          <div><strong>Total Supply:</strong> {market_data.total_supply?.toLocaleString() || "N/A"}</div>
        </div>
      </section>

      <section aria-labelledby="chart-heading" className="mb-8">
        <h2 id="chart-heading" className="text-xl font-semibold mb-2">Price Chart</h2>

        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Select time range">
          {Object.keys(RANGE_OPTIONS).map((range) => (
            <button
              key={range}
              onClick={() => setChartRange(range)}
              className={`px-3 py-1 rounded ${
                chartRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              aria-pressed={chartRange === range}
            >
              {range}
            </button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">No chart data available.</p>
        ) : (
          <div role="img" aria-label={`Price chart for ${crypto.name} over ${chartRange}`} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" interval="preserveStartEnd" tick={{ fontSize: 10 }} />
                <YAxis
                  domain={yAxisDomain}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(value) => `$${value.toFixed(4)}`} labelStyle={{ fontWeight: "bold" }} />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="price" stroke="#3182ce" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}

