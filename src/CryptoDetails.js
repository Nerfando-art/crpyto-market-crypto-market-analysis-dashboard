import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CryptoDetails() {
  const { id } = useParams();
  const [crypto, setCrypto] = useState(null);

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
      .then((res) => res.json())
      .then((data) => setCrypto(data))
      .catch(console.error);
  }, [id]);

  if (!crypto) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{crypto.name}</h1>
      <p>Market Cap: ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
      <Link to="/" className="text-blue-500">Back to Dashboard</Link>
    </div>
  );
}
